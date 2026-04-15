# DejaQ Admin CLI — Instructions

All commands run from the `server/` directory using `uv run`.

## Prerequisites

```bash
cd server
uv sync          # install dependencies
alembic upgrade head   # ensure database schema is up to date
```

---

## Admin CLI (`dejaq-admin`)

The admin CLI manages orgs, departments, and API keys stored in `dejaq.db`.

### `org` — Manage organizations

---

#### `org create`

Create a new organization. The slug is auto-derived from the name.

```bash
uv run dejaq-admin org create --name "Acme Corp"
```

Output: `id`, `name`, `slug`

---

#### `org list`

List all organizations.

```bash
uv run dejaq-admin org list
```

Output: table of `ID`, `Name`, `Slug`, `Created`

---

#### `org delete`

Delete an organization and all its departments (cascade). Prompts for confirmation if departments exist.

```bash
uv run dejaq-admin org delete --slug "acme-corp"
```

Flag | Description
-----|------------
`--slug` | Slug of the org to delete (required)

---

### `dept` — Manage departments

Each department gets a `cache_namespace` in the format `{org_slug}__{dept_slug}`. This is the ChromaDB collection name used for cache isolation.

---

#### `dept create`

Create a department under an org.

```bash
uv run dejaq-admin dept create --org "acme-corp" --name "Customer Support"
```

Flag | Description
-----|------------
`--org` | Parent org slug (required)
`--name` | Display name for the department (required)

Output: `id`, `name`, `slug`, `cache_namespace`

---

#### `dept list`

List departments. Without `--org`, lists all departments across all orgs.

```bash
# All departments across all orgs
uv run dejaq-admin dept list

# Departments under a specific org
uv run dejaq-admin dept list --org "acme-corp"
```

Flag | Description
-----|------------
`--org` | Filter by org slug (optional)

---

#### `dept delete`

Delete a department by slug. Prompts for confirmation.

```bash
uv run dejaq-admin dept delete --org "acme-corp" --slug "customer-support"
```

Flag | Description
-----|------------
`--org` | Parent org slug (required)
`--slug` | Department slug to delete (required)

---

### `key` — Manage API keys

Each org gets one active API key at a time. Chatbots send the key as a Bearer token. Keys are long-lived — revoke and regenerate to rotate.

---

#### `key generate`

Generate an API key for an org. Fails if the org already has an active key unless `--force` is passed.

```bash
# First key
uv run dejaq-admin key generate --org "acme-corp"

# Rotate — revokes the existing key and issues a new one
uv run dejaq-admin key generate --org "acme-corp" --force
```

Flag | Description
-----|------------
`--org` | Org slug (required)
`--force` | Revoke existing active key and generate a new one

Output: `id`, `org`, full token value, `created_at`

> Copy the token immediately — it is only shown once at generation time (though it is stored in plaintext in `dejaq.db`).

---

#### `key list`

List all keys (active and revoked) for an org.

```bash
uv run dejaq-admin key list --org "acme-corp"
```

Flag | Description
-----|------------
`--org` | Org slug (required)

Output: table of `ID`, truncated token, `Created`, `Revoked` (`—` if still active)

---

#### `key revoke`

Revoke a key by its numeric ID. The key remains in the database for audit purposes but stops being accepted within one TTL window (default 60 seconds).

```bash
uv run dejaq-admin key revoke --id 3
```

Flag | Description
-----|------------
`--id` | Numeric ID of the key to revoke (required)

---

## Typical end-to-end setup

```bash
# 1. Create an org
uv run dejaq-admin org create --name "Acme Corp"

# 2. Create departments (optional — for cache isolation between teams)
uv run dejaq-admin dept create --org "acme-corp" --name "Customer Support"
uv run dejaq-admin dept create --org "acme-corp" --name "Engineering"

# 3. Generate the org's API key
uv run dejaq-admin key generate --org "acme-corp"
# → token: <paste this into your chatbot config>

# 4. Point your chatbot at DejaQ
#    Authorization: Bearer <token>
#    X-DejaQ-Department: customer-support   ← optional, for dept isolation
```

---

## TUI — Interactive Terminal Interface (`dejaq-admin-tui`)

The TUI is a fullscreen interactive alternative to the CLI. It lets you browse orgs and departments visually and create or delete them without typing flags.

### Launch

```bash
cd server
uv run dejaq-admin-tui
```

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Header                                    [clock]   │
├──────────────────┬──────────────────────────────────┤
│  Organizations   │  Departments — <selected org>    │
│  ─────────────   │  ┌────┬──────┬──────┬─────────┐  │
│  Acme Corp       │  │ ID │ Name │ Slug │ NS      │  │
│  Beta Inc        │  │ …  │ …    │ …    │ …       │  │
│  …               │  └────┴──────┴──────┴─────────┘  │
├──────────────────┴──────────────────────────────────┤
│ Footer: n=New  d=Delete  q=Quit                     │
└─────────────────────────────────────────────────────┘
```

### Keyboard shortcuts

Key | Action
----|-------
`↑` / `↓` | Navigate org list or department table
`n` | **New** — opens a dialog to create an org (if no org selected) or a department (if an org is selected)
`d` | **Delete** — deletes the focused org or department
`q` | Quit

### Notes

- Selecting an org in the left sidebar loads its departments in the right panel.
- Pressing `n` with no org selected opens the **New Organization** dialog.
- Pressing `n` with an org selected opens the **New Department** dialog scoped to that org.
- Pressing `d` with a department row focused deletes that department.
- Pressing `d` with an org highlighted (and no department focused) deletes the org and all its departments.
- Status messages appear at the bottom of the screen after each action.
- The TUI does not manage API keys — use the CLI `key` commands for that.
