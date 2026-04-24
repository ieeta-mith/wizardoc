from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from src.core.deps import AuthenticatedUser, get_authenticated_user
from src.core.settings import settings

router = APIRouter()


class UserResult(BaseModel):
    id: str
    username: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None


@router.get("/search", response_model=list[UserResult])
async def search_users(
    q: str = Query(min_length=2, description="Email or username substring"),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    if not settings.API_IAM_SERVER_URL or not settings.API_IAM_COMMUNITY_SLUG or not settings.API_IAM_PLUGIN_SLUG:
        return []

    parsed = urlparse(settings.API_IAM_SERVER_URL)
    iam_base = f"{parsed.scheme}://{parsed.netloc}"
    members_url = f"{iam_base}/plugin/community/{settings.API_IAM_COMMUNITY_SLUG}/member/"
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(
                members_url,
                params={"plugin_slug": settings.API_IAM_PLUGIN_SLUG},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="User directory unavailable") from exc

    if response.status_code >= 400:
        return []

    data = response.json()
    members: list[dict] = data.get("members", [])

    q_lower = q.lower()
    results: list[UserResult] = []
    for m in members:
        if m.get("id") == user.id:
            continue
        email = (m.get("email") or "").lower()
        username = (m.get("username") or "").lower()
        if q_lower in email or q_lower in username:
            results.append(
                UserResult(
                    id=m["id"],
                    username=m.get("username"),
                    firstName=m.get("first_name"),
                    lastName=m.get("last_name"),
                    email=m.get("email"),
                )
            )
        if len(results) >= 10:
            break

    return results
