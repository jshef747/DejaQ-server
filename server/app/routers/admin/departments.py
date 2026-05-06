from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.admin_auth import require_management_auth
from app.dependencies.management_auth import ManagementAuthContext
from app.schemas.admin.departments import (
    DepartmentCreate,
    DepartmentDeleteResponse,
    DepartmentItem,
)
from app.services import admin_service

router = APIRouter()


@router.get("/departments", response_model=list[DepartmentItem])
def list_departments(
    org: str | None = Query(default=None),
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.list_departments(org_slug=org, ctx=ctx)
    except admin_service.OrgNotFound:
        return []
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.post(
    "/orgs/{org_slug}/departments",
    response_model=DepartmentItem,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    org_slug: str,
    body: DepartmentCreate,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.create_department(org_slug, body.name, ctx=ctx)
    except admin_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except admin_service.DuplicateSlug as exc:
        raise HTTPException(status_code=409, detail="Department slug already exists") from exc


@router.delete(
    "/orgs/{org_slug}/departments/{dept_slug}",
    response_model=DepartmentDeleteResponse,
)
def delete_department(
    org_slug: str,
    dept_slug: str,
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    try:
        return admin_service.delete_department(org_slug, dept_slug, ctx=ctx)
    except admin_service.OrgNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except admin_service.OrgForbidden as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except admin_service.DeptNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
