import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.api_key import ApiKey


def create_key(session: Session, org_id: int) -> ApiKey:
    token = secrets.token_urlsafe(32)
    key = ApiKey(org_id=org_id, token=token)
    session.add(key)
    session.flush()
    session.refresh(key)
    return key


def get_active_key_by_token(session: Session, token: str) -> ApiKey | None:
    return (
        session.query(ApiKey)
        .filter(ApiKey.token == token, ApiKey.revoked_at.is_(None))
        .first()
    )


def get_active_key_for_org(session: Session, org_id: int) -> ApiKey | None:
    return (
        session.query(ApiKey)
        .filter(ApiKey.org_id == org_id, ApiKey.revoked_at.is_(None))
        .first()
    )


def list_keys_for_org(session: Session, org_id: int) -> list[ApiKey]:
    return (
        session.query(ApiKey)
        .filter(ApiKey.org_id == org_id)
        .order_by(ApiKey.created_at.desc())
        .all()
    )


def revoke_key(session: Session, key_id: int) -> ApiKey | None:
    key = session.query(ApiKey).filter(ApiKey.id == key_id).first()
    if key is None:
        return None
    if key.revoked_at is not None:
        return key  # already revoked — return as-is
    key.revoked_at = datetime.now(timezone.utc)
    session.flush()
    session.refresh(key)
    return key
