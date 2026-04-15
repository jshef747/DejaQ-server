"""
DejaQ Admin TUI — interactive terminal interface.

Usage:  uv run dejaq-admin-tui
Keys:   n = new  |  d = delete  |  k = generate key  |  r = revoke key  |  q = quit  |  ↑↓ = navigate
"""

from __future__ import annotations

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.widgets import (
    Button,
    DataTable,
    Footer,
    Header,
    Input,
    Label,
    ListItem,
    ListView,
    Static,
)

from app.db import dept_repo, org_repo
from app.db import api_key_repo
from app.db.session import get_session
from app.schemas.org import OrgRead


# ---------------------------------------------------------------------------
# Modal: Create Org
# ---------------------------------------------------------------------------

class NewOrgScreen(ModalScreen[str | None]):
    CSS = """
    NewOrgScreen {
        align: center middle;
    }
    #dialog {
        width: 60;
        height: auto;
        border: thick $accent;
        background: $surface;
        padding: 1 2;
    }
    #dialog Label { margin-bottom: 1; }
    #dialog Input  { margin-bottom: 1; }
    #buttons { margin-top: 1; }
    """

    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label("[bold cyan]New Organization[/bold cyan]")
            yield Input(placeholder="Organization name…", id="org-name")
            with Horizontal(id="buttons"):
                yield Button("Create", variant="success", id="create")
                yield Button("Cancel", variant="default", id="cancel")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "create":
            value = self.query_one("#org-name", Input).value.strip()
            self.dismiss(value if value else None)
        else:
            self.dismiss(None)


# ---------------------------------------------------------------------------
# Modal: Create Dept
# ---------------------------------------------------------------------------

class NewDeptScreen(ModalScreen[str | None]):
    CSS = """
    NewDeptScreen {
        align: center middle;
    }
    #dialog {
        width: 60;
        height: auto;
        border: thick $accent;
        background: $surface;
        padding: 1 2;
    }
    #dialog Label { margin-bottom: 1; }
    #dialog Input  { margin-bottom: 1; }
    #buttons { margin-top: 1; }
    """

    def __init__(self, org_slug: str) -> None:
        super().__init__()
        self.org_slug = org_slug

    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label(f"[bold cyan]New Department[/bold cyan]  [dim]under {self.org_slug}[/dim]")
            yield Input(placeholder="Department name…", id="dept-name")
            with Horizontal(id="buttons"):
                yield Button("Create", variant="success", id="create")
                yield Button("Cancel", variant="default", id="cancel")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "create":
            value = self.query_one("#dept-name", Input).value.strip()
            self.dismiss(value if value else None)
        else:
            self.dismiss(None)


# ---------------------------------------------------------------------------
# Modal: Confirm key generation (force-revoke warning)
# ---------------------------------------------------------------------------

class ConfirmKeyScreen(ModalScreen[bool]):
    CSS = """
    ConfirmKeyScreen {
        align: center middle;
    }
    #dialog {
        width: 64;
        height: auto;
        border: thick $warning;
        background: $surface;
        padding: 1 2;
    }
    #dialog Label { margin-bottom: 1; }
    #buttons { margin-top: 1; }
    """

    def __init__(self, org_slug: str) -> None:
        super().__init__()
        self.org_slug = org_slug

    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label(
                f"[bold yellow]'{self.org_slug}' already has an active key.[/bold yellow]\n"
                "Generating a new one will [bold red]revoke[/bold red] the existing key immediately.\n"
                "Any chatbot using the old key will stop working."
            )
            with Horizontal(id="buttons"):
                yield Button("Revoke & Generate", variant="warning", id="confirm")
                yield Button("Cancel", variant="default", id="cancel")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.dismiss(event.button.id == "confirm")


# ---------------------------------------------------------------------------
# Modal: Display generated key (read-only, copy prompt)
# ---------------------------------------------------------------------------

class ShowKeyScreen(ModalScreen[None]):
    CSS = """
    ShowKeyScreen {
        align: center middle;
    }
    #dialog {
        width: 72;
        height: auto;
        border: thick $success;
        background: $surface;
        padding: 1 2;
    }
    #dialog Label { margin-bottom: 1; }
    #token-box {
        background: $surface-darken-2;
        padding: 0 1;
        margin-bottom: 1;
    }
    """

    def __init__(self, token: str) -> None:
        super().__init__()
        self.token = token

    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label("[bold green]API key generated[/bold green]  —  copy it now, it won't be shown again in full.")
            with Static(id="token-box"):
                yield Label(self.token)
            yield Button("Done", variant="success", id="done")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.dismiss(None)


# ---------------------------------------------------------------------------
# Main App
# ---------------------------------------------------------------------------

class DejaQAdminApp(App):
    TITLE = "DejaQ Admin"
    SUB_TITLE = "Orgs · Departments · Cache Namespaces"
    CSS = """
    Screen {
        layout: horizontal;
    }
    #sidebar {
        width: 30;
        border-right: solid $accent-darken-2;
        background: $surface;
    }
    #sidebar-title {
        background: $accent-darken-3;
        color: $text;
        padding: 0 1;
        text-style: bold;
    }
    #org-list {
        height: 1fr;
    }
    #main {
        width: 1fr;
        padding: 0 1;
        layout: vertical;
    }
    #dept-title {
        padding: 0 1;
        color: $accent;
        text-style: bold;
        height: 1;
    }
    #dept-table {
        height: 1fr;
    }
    #key-panel {
        height: auto;
        border-top: solid $accent-darken-2;
        padding: 0 1;
        background: $surface-darken-1;
    }
    #key-title {
        color: $accent;
        text-style: bold;
        height: 1;
        padding-top: 1;
    }
    #key-value {
        height: 1;
        color: $text-muted;
    }
    #status-bar {
        height: 1;
        padding: 0 1;
        color: $text-muted;
        background: $surface-darken-1;
    }
    """

    BINDINGS = [
        Binding("n", "new", "New"),
        Binding("d", "delete", "Delete"),
        Binding("k", "generate_key", "Gen Key"),
        Binding("r", "revoke_key", "Revoke Key"),
        Binding("q", "quit", "Quit"),
    ]

    selected_org: reactive[OrgRead | None] = reactive(None)

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal():
            with Vertical(id="sidebar"):
                yield Static("  Organizations", id="sidebar-title")
                yield ListView(id="org-list")
            with Vertical(id="main"):
                yield Static("Select an org to view departments", id="dept-title")
                yield DataTable(id="dept-table", cursor_type="row")
                with Vertical(id="key-panel"):
                    yield Static("API Key", id="key-title")
                    yield Static("[dim]—[/dim]", id="key-value")
                yield Static("", id="status-bar")
        yield Footer()

    async def on_mount(self) -> None:
        table = self.query_one("#dept-table", DataTable)
        table.add_columns("ID", "Name", "Slug", "Cache Namespace", "Created")
        await self._refresh_orgs()

    # ------------------------------------------------------------------
    # Data helpers

    async def _refresh_orgs(self) -> None:
        lv = self.query_one("#org-list", ListView)
        await lv.clear()
        with get_session() as session:
            orgs = org_repo.list_orgs(session)
        self._orgs = orgs
        for o in orgs:
            await lv.append(ListItem(Label(f" {o.name}  [dim]{o.slug}[/dim]"), id=f"org-{o.id}"))

    def _refresh_depts(self, org: OrgRead) -> None:
        table = self.query_one("#dept-table", DataTable)
        table.clear()
        with get_session() as session:
            depts = dept_repo.list_depts(session, org_slug=org.slug)
        for d in depts:
            table.add_row(
                str(d.id),
                d.name,
                d.slug,
                f"[dim cyan]{d.cache_namespace}[/dim cyan]",
                d.created_at.strftime("%Y-%m-%d %H:%M"),
                key=str(d.id),
            )
        self.query_one("#dept-title", Static).update(
            f"Departments — [cyan]{org.name}[/cyan]  [dim]({len(depts)} total)[/dim]"
        )

    def _refresh_key(self, org: OrgRead) -> None:
        with get_session() as session:
            active = api_key_repo.get_active_key_for_org(session, org.id)
            if active:
                token = active.token
                key_id = active.id
                created = active.created_at
            else:
                token = None

        key_widget = self.query_one("#key-value", Static)
        if token:
            key_widget.update(
                f"[bold cyan]{token[:20]}…[/bold cyan]  "
                f"[dim]id={key_id}  created {created.strftime('%Y-%m-%d')}[/dim]  "
                f"[dim](r to revoke)[/dim]"
            )
        else:
            key_widget.update("[dim]No active key — press k to generate[/dim]")

    def _set_status(self, msg: str) -> None:
        self.query_one("#status-bar", Static).update(msg)

    # ------------------------------------------------------------------
    # Events

    def on_list_view_selected(self, event: ListView.Selected) -> None:
        item_id = event.item.id  # "org-<id>"
        if item_id and item_id.startswith("org-"):
            org_id = int(item_id.split("-", 1)[1])
            self.selected_org = next((o for o in self._orgs if o.id == org_id), None)
            if self.selected_org:
                self._refresh_depts(self.selected_org)
                self._refresh_key(self.selected_org)

    # ------------------------------------------------------------------
    # Actions

    def action_new(self) -> None:
        if self.selected_org is None:
            self.push_screen(NewOrgScreen(), self._handle_new_org)
        else:
            self.push_screen(NewDeptScreen(self.selected_org.slug), self._handle_new_dept)

    async def _handle_new_org(self, name: str | None) -> None:
        if not name:
            return
        try:
            with get_session() as session:
                org_repo.create_org(session, name)
            await self._refresh_orgs()
            self._set_status(f"✓ Created org '{name}'")
        except ValueError as e:
            self._set_status(f"✗ {e}")

    def _handle_new_dept(self, name: str | None) -> None:
        if not name or not self.selected_org:
            return
        try:
            with get_session() as session:
                dept_repo.create_dept(session, self.selected_org.slug, name)
            self._refresh_depts(self.selected_org)
            self._set_status(f"✓ Created department '{name}'")
        except ValueError as e:
            self._set_status(f"✗ {e}")

    def action_generate_key(self) -> None:
        if self.selected_org is None:
            self._set_status("✗ Select an org first")
            return

        with get_session() as session:
            existing = api_key_repo.get_active_key_for_org(session, self.selected_org.id)

        if existing:
            self.push_screen(ConfirmKeyScreen(self.selected_org.slug), self._handle_generate_key)
        else:
            self._do_generate_key(force=False)

    def _handle_generate_key(self, confirmed: bool) -> None:
        if confirmed:
            self._do_generate_key(force=True)

    def _do_generate_key(self, force: bool) -> None:
        assert self.selected_org is not None
        try:
            with get_session() as session:
                if force:
                    existing = api_key_repo.get_active_key_for_org(session, self.selected_org.id)
                    if existing:
                        api_key_repo.revoke_key(session, existing.id)
                new_key = api_key_repo.create_key(session, self.selected_org.id)
                token = new_key.token
            self._refresh_key(self.selected_org)
            self._set_status(f"✓ Key generated for '{self.selected_org.slug}'")
            self.push_screen(ShowKeyScreen(token))
        except Exception as e:
            self._set_status(f"✗ {e}")

    def action_revoke_key(self) -> None:
        if self.selected_org is None:
            self._set_status("✗ Select an org first")
            return
        with get_session() as session:
            existing = api_key_repo.get_active_key_for_org(session, self.selected_org.id)
            if existing is None:
                self._set_status("No active key to revoke")
                return
            key_id = existing.id
            api_key_repo.revoke_key(session, key_id)
        self._refresh_key(self.selected_org)
        self._set_status(f"✓ Key id={key_id} revoked")

    async def action_delete(self) -> None:
        table = self.query_one("#dept-table", DataTable)
        lv = self.query_one("#org-list", ListView)

        if self.selected_org and table.cursor_row >= 0 and table.row_count > 0:
            # Delete focused department
            row_key = table.get_row_at(table.cursor_row)[0]  # ID is first col
            dept_id = str(row_key)
            with get_session() as session:
                depts = dept_repo.list_depts(session, org_slug=self.selected_org.slug)
            target = next((d for d in depts if str(d.id) == dept_id), None)
            if target:
                try:
                    with get_session() as session:
                        dept_repo.delete_dept(session, self.selected_org.slug, target.slug)
                    self._refresh_depts(self.selected_org)
                    self._set_status(f"✓ Deleted department '{target.slug}'")
                except ValueError as e:
                    self._set_status(f"✗ {e}")
        elif lv.highlighted_child is not None:
            # Delete focused org
            item_id = lv.highlighted_child.id
            if item_id and item_id.startswith("org-"):
                org_id = int(item_id.split("-", 1)[1])
                target_org = next((o for o in self._orgs if o.id == org_id), None)
                if target_org:
                    try:
                        with get_session() as session:
                            org_repo.delete_org(session, target_org.slug)
                        self.selected_org = None
                        await self._refresh_orgs()
                        table.clear()
                        self.query_one("#dept-title", Static).update("Select an org to view departments")
                        self.query_one("#key-value", Static).update("[dim]—[/dim]")
                        self._set_status(f"✓ Deleted org '{target_org.slug}'")
                    except ValueError as e:
                        self._set_status(f"✗ {e}")


def run() -> None:
    DejaQAdminApp().run()


if __name__ == "__main__":
    run()
