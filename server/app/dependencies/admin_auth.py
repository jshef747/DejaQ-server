import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.dependencies.management_auth import ManagementAuthContext
from app.services.management_auth_service import (
    SupabaseAuthInvalid,
    SupabaseAuthNotConfigured,
    SupabaseAuthUnavailable,
    validate_token_and_build_context,
)

logger = logging.getLogger("dejaq.dependencies.admin_auth")

_bearer = HTTPBearer(auto_error=False)


def require_management_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> ManagementAuthContext:
    """FastAPI dependency: validate Supabase JWT and return ManagementAuthContext.

    Returns a user-scoped ManagementAuthContext on success.
    Raises 401 for missing/invalid tokens, 503 for SDK configuration or transport failures.
    Never logs token contents or raw authorization headers.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return validate_token_and_build_context(credentials.credentials)
    except SupabaseAuthNotConfigured:
        logger.warning("Supabase Auth not configured — management API unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Management API unavailable: Supabase Auth not configured",
        )
    except SupabaseAuthUnavailable:
        logger.error("Supabase Auth SDK transport failure on management request")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Management API temporarily unavailable",
        )
    except SupabaseAuthInvalid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
