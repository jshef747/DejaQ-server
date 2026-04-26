from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies.admin_auth import require_management_auth
from app.dependencies.management_auth import ManagementAuthContext
from app.schemas.admin.stats import DepartmentStatsReport, OrgStatsReport
from app.services import admin_service, stats_service

router = APIRouter()


@router.get("/stats/orgs", response_model=OrgStatsReport)
def org_stats(
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    accessible_slugs = None if ctx.is_system else {o.slug for o in ctx.accessible_orgs}
    try:
        return stats_service.org_stats(from_date=from_date, to_date=to_date, accessible_org_slugs=accessible_slugs)
    except stats_service.InvalidDateRange as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/stats/orgs/{org_slug}/departments", response_model=DepartmentStatsReport)
def department_stats(
    org_slug: str,
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    ctx: ManagementAuthContext = Depends(require_management_auth),
):
    orgs = admin_service.list_orgs(ctx=ManagementAuthContext.system())
    if not any(org.slug == org_slug for org in orgs):
        raise HTTPException(status_code=404, detail=f"Organization '{org_slug}' not found.")
    if not ctx.has_org_access_by_slug(org_slug):
        raise HTTPException(status_code=403, detail=f"Access denied to organization '{org_slug}'.")
    try:
        return stats_service.department_stats(org_slug, from_date=from_date, to_date=to_date)
    except stats_service.InvalidDateRange as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
