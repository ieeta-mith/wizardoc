from urllib.parse import urljoin

import httpx
from fastapi import Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from src.core.settings import settings


class AuthenticatedUser(BaseModel):
    id: str
    username: str | None = None
    email: str | None = None
    is_admin: bool = False


def _build_auth_status_url(base_url: str) -> str:
    return urljoin(f"{base_url.rstrip('/')}/", "auth/status/")


def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.mongo_db


def _normalize_role(role: str) -> str:
    return role.strip().lower().replace("_", "-")


def _extract_role_names(raw_roles: object) -> set[str]:
    if raw_roles is None:
        return set()

    if isinstance(raw_roles, str):
        return {_normalize_role(raw_roles)}

    if isinstance(raw_roles, (list, tuple, set)):
        roles: set[str] = set()
        for item in raw_roles:
            roles.update(_extract_role_names(item))
        return roles

    if isinstance(raw_roles, dict):
        roles: set[str] = set()
        for key in ("name", "role", "slug", "code", "value"):
            value = raw_roles.get(key)
            if isinstance(value, str):
                roles.add(_normalize_role(value))
        return roles

    return set()


def _is_admin_from_payload(payload: dict, user_data: dict) -> bool:
    for key in ("is_admin", "isAdmin"):
        user_flag = user_data.get(key)
        if isinstance(user_flag, bool):
            return user_flag
        payload_flag = payload.get(key)
        if isinstance(payload_flag, bool):
            return payload_flag

    role_candidates = (
        user_data.get("roles"),
        user_data.get("role"),
        user_data.get("groups"),
        user_data.get("authorities"),
        payload.get("roles"),
        payload.get("role"),
    )
    role_names: set[str] = set()
    for candidate in role_candidates:
        role_names.update(_extract_role_names(candidate))

    if not role_names:
        return False

    admin_roles = {"admin", "administrator", "super-admin", "superadmin"}
    return any(
        role in admin_roles or role.endswith("-admin") or role.endswith(":admin")
        for role in role_names
    )


async def get_authenticated_user(request: Request) -> AuthenticatedUser:
    if not settings.API_IAM_SERVER_URL:
        raise HTTPException(
            status_code=500,
            detail="API_IAM_SERVER_URL is not configured",
        )

    headers: dict[str, str] = {}
    cookie_header = request.headers.get("cookie")
    if cookie_header:
        headers["cookie"] = cookie_header

    auth_status_url = _build_auth_status_url(settings.API_IAM_SERVER_URL)

    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(auth_status_url, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to validate authentication status",
        ) from exc

    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Authentication required")
    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail="Authentication service returned an invalid response",
        )

    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail="Authentication service returned invalid JSON",
        ) from exc

    if not payload.get("authenticated"):
        raise HTTPException(status_code=401, detail="Authentication required")

    user_data = payload.get("user") or {}
    user_id = user_data.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    return AuthenticatedUser(
        id=user_id,
        username=user_data.get("username"),
        email=user_data.get("email"),
        is_admin=_is_admin_from_payload(payload, user_data),
    )


async def require_admin_user(
    user: AuthenticatedUser = Depends(get_authenticated_user),
) -> AuthenticatedUser:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
