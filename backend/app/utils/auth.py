"""
Authentication & Role-Based Access Control (RBAC) Dependency
Verifies Firebase Auth JWT ID Tokens from the Authorization: Bearer <token> header.
Includes graceful development bypass for offline local testing and mock users.
"""
import logging
from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.schemas.common import UserRole

logger = logging.getLogger("bhunetra.auth")
security = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    def __init__(self, uid: str, email: str, role: str, claims: Optional[Dict[str, Any]] = None):
        self.uid = uid
        self.email = email
        self.role = role
        self.claims = claims or {}

    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    def is_verifier(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.VERIFIER]

    def is_officer(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.OFFICER]


# Mock dev users for frontend/testing when Firebase live auth is bypassed
DEV_MOCK_USERS = {
    "admin": AuthenticatedUser(uid="dev-admin-uid", email="admin@bhunetra.gov.in", role=UserRole.ADMIN),
    "verifier": AuthenticatedUser(uid="dev-verifier-uid", email="verifier@bhunetra.gov.in", role=UserRole.VERIFIER),
    "officer": AuthenticatedUser(uid="dev-officer-uid", email="officer@bhunetra.gov.in", role=UserRole.OFFICER),
}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> AuthenticatedUser:
    """
    FastAPI dependency that validates Firebase ID Token.
    Returns AuthenticatedUser instance with uid, email, and role.
    """
    # 1. Check if dev authorization bypass is allowed and no token or special dev token passed
    if settings.ALLOW_DEV_AUTH_BYPASS:
        if not credentials:
            # Default dev user is admin in local testing
            return DEV_MOCK_USERS["admin"]
        
        token = credentials.credentials
        if token.lower() in ["dev-admin-token", "admin", "dev_token"]:
            return DEV_MOCK_USERS["admin"]
        elif token.lower() in ["dev-verifier-token", "verifier"]:
            return DEV_MOCK_USERS["verifier"]
        elif token.lower() in ["dev-officer-token", "officer"]:
            return DEV_MOCK_USERS["officer"]

    # 2. If credentials are missing in production mode
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # 3. Live Firebase ID token verification
    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email", "")
        # Role from custom claims or defaults to officer
        role = decoded_token.get("role", UserRole.OFFICER)

        return AuthenticatedUser(
            uid=uid,
            email=email,
            role=role,
            claims=decoded_token
        )
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory to enforce role-based access control (RBAC).
    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role([UserRole.ADMIN]))])
    """
    async def role_checker(user: AuthenticatedUser = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{user.role}' is not authorized. Allowed roles: {[r.value for r in allowed_roles]}"
            )
        return user

    return role_checker
