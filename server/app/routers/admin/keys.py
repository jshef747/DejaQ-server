from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.admin_auth import require_management_auth
from app.dependencies.management_auth import ManagementAuthContext
from app.schemas.admin.keys import KeyCreated, KeyItem, KeyRevokeResponse
from app.services import admin_service

router = APIRouter()


@router.get("/orgs/{org_slug}/keys", response_model=list[KeyItem])
def list_keys(
    org_slug: str,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.list_keys(org_slug, ctx=ctx)
    except admin_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.post(
    "/orgs/{org_slug}/keys",
    response_model=KeyCreated,
    status_code=status.HTTP_201_CREATED,
)
def generate_key(
    org_slug: str,
    force: bool = Query(default=False),
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.generate_key(org_slug, force=force, ctx=ctx)
    except admin_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except admin_service.ActiveKeyExists as exc:
        raise HTTPException(
            status_code=409,
            detail="Active key exists; use ?force=true to rotate it",
        ) from exc


@router.delete("/keys/{key_id}", response_model=KeyRevokeResponse)
def revoke_key(
    key_id: int,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.revoke_key(key_id, ctx=ctx)
    except admin_service.KeyNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.KeyForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
