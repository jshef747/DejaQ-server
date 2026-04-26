from fastapi import APIRouter

from app.routers.admin import departments, feedback, keys, llm_config, orgs, stats, whoami

router = APIRouter(prefix="/admin/v1")
router.include_router(whoami.router)
router.include_router(orgs.router)
router.include_router(departments.router)
router.include_router(keys.router)
router.include_router(stats.router)
router.include_router(llm_config.router)
router.include_router(feedback.router)
