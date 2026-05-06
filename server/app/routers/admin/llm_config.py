from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.admin_auth import require_management_auth
from app.dependencies.management_auth import ManagementAuthContext
from app.schemas.admin.llm_config import LlmConfigResponse, LlmConfigUpdate
from app.services import llm_config_service
from app.db.session import get_session
from app.db.models.org import Organization

router = APIRouter()


def _check_org_access_by_slug(slug: str, ctx: ManagementAuthContext) -> None:
    with get_session() as session:
        org = session.query(Organization).filter_by(slug=slug).first()
        if org is None:
            raise llm_config_service.OrgNotFound(slug)
        org_id = org.id
    if not ctx.has_org_access(org_id):
        raise HTTPException(status_code=403, detail=f"Access denied to organization '{slug}'.")


@router.get("/orgs/{org_slug}/llm-config", response_model=LlmConfigResponse)
def read_llm_config(
    org_slug: str,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        _check_org_access_by_slug(org_slug, ctx)
        return llm_config_service.read_for_org(org_slug)
    except llm_config_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/orgs/{org_slug}/llm-config", response_model=LlmConfigResponse)
def update_llm_config(
    org_slug: str,
    body: LlmConfigUpdate,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        _check_org_access_by_slug(org_slug, ctx)
        return llm_config_service.update_for_org(
            org_slug,
            body.model_dump(),
            set(body.model_fields_set),
        )
    except llm_config_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except llm_config_service.InvalidLlmConfigUpdate as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
