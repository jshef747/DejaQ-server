import logging
from typing import NamedTuple

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.middleware.api_key import _KEY_CACHE

logger = logging.getLogger("dejaq.dependencies.auth")

_bearer = HTTPBearer(auto_error=False)


class ResolvedOrg(NamedTuple):
    org_slug: str
    org_id: int


def require_org_key(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> ResolvedOrg:
    """FastAPI dependency: resolve Bearer token to an org via the key cache.

    Returns ResolvedOrg(org_slug, org_id) on success.
    Raises 401 if the token is missing, unrecognized, or revoked.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    resolved = _KEY_CACHE.resolve(credentials.credentials)
    if resolved is None:
        redacted = credentials.credentials[:8] + "..." if len(credentials.credentials) > 8 else credentials.credentials
        logger.warning("Invalid API key presented to auth dependency: %s", redacted)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    org_slug, org_id = resolved
    return ResolvedOrg(org_slug=org_slug, org_id=org_id)
