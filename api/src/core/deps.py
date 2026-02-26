from urllib.parse import urljoin

import httpx
from fastapi import HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from src.core.settings import settings


class AuthenticatedUser(BaseModel):
    id: str
    username: str | None = None
    email: str | None = None


def _build_auth_status_url(base_url: str) -> str:
    return urljoin(f"{base_url.rstrip('/')}/", "auth/status/")


def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.mongo_db


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
    )
