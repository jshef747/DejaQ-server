from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.admin_auth import require_management_auth
from app.dependencies.management_auth import ManagementAuthContext
from app.schemas.admin.orgs import OrgCreate, OrgDeleteResponse, OrgItem
from app.services import admin_service

router = APIRouter()


@router.get("/orgs", response_model=list[OrgItem])
def list_orgs(ctx: ManagementAuthContext = Depends(require_management_auth)):
    return admin_service.list_orgs(ctx=ctx)


@router.post("/orgs", response_model=OrgItem, status_code=status.HTTP_201_CREATED)
def create_org(
    body: OrgCreate,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.create_org(body.name, ctx=ctx)
    except admin_service.DuplicateSlug as exc:
        raise HTTPException(status_code=409, detail="Organization slug already exists") from exc


@router.delete("/orgs/{slug}", response_model=OrgDeleteResponse)
def delete_org(
    slug: str,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.delete_org(slug, ctx=ctx)
    except admin_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
