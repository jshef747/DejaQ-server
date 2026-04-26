from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.models.org import Organization
from app.db.models.user import ManagementUser
from app.db.models.user_org_membership import UserOrgMembership


def upsert_user(session: Session, supabase_user_id: str, email: str) -> ManagementUser:
    """Find or create a local user by Supabase user id; refresh email if changed."""
    user = session.query(ManagementUser).filter_by(supabase_user_id=supabase_user_id).first()
    if user is None:
        user = ManagementUser(supabase_user_id=supabase_user_id, email=email)
        session.add(user)
        session.flush()
    elif user.email != email:
        user.email = email
        session.flush()
    return user


def list_memberships(session: Session, user_id: int) -> list[UserOrgMembership]:
    return (
        session.query(UserOrgMembership)
        .filter_by(user_id=user_id)
        .all()
    )


def create_membership_idempotent(session: Session, user_id: int, org_id: int) -> UserOrgMembership:
    """Create user-org membership; silently ignore duplicate."""
    existing = (
        session.query(UserOrgMembership)
        .filter_by(user_id=user_id, org_id=org_id)
        .first()
    )
    if existing:
        return existing
    membership = UserOrgMembership(user_id=user_id, org_id=org_id)
    session.add(membership)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        existing = (
            session.query(UserOrgMembership)
            .filter_by(user_id=user_id, org_id=org_id)
            .first()
        )
        return existing  # type: ignore[return-value]
    return membership


def get_accessible_org_ids(session: Session, user_id: int) -> list[int]:
    rows = session.query(UserOrgMembership.org_id).filter_by(user_id=user_id).all()
    return [r[0] for r in rows]


def get_accessible_orgs(session: Session, user_id: int) -> list[Organization]:
    org_ids = get_accessible_org_ids(session, user_id)
    if not org_ids:
        return []
    return session.query(Organization).filter(Organization.id.in_(org_ids)).all()
