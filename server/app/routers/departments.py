import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import dept_repo
from app.db.session import get_session
from app.dependencies.auth import ResolvedOrg, require_org_key

logger = logging.getLogger("dejaq.router.departments")

router = APIRouter()


class DepartmentItem(BaseModel):
    id: int
    label: str
    slug: str


@router.get("/departments", response_model=list[DepartmentItem])
def get_departments(org: ResolvedOrg = Depends(require_org_key)) -> list[DepartmentItem]:
    """Return the departments belonging to the authenticated org.

    Authorization: Bearer <org-api-key>
    """
    with get_session() as session:
        depts = dept_repo.list_depts(session, org_slug=org.org_slug)

    logger.info("GET /departments org=%s count=%d", org.org_slug, len(depts))
    return [DepartmentItem(id=d.id, label=d.name, slug=d.slug) for d in depts]
