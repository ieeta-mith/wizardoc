from fastapi import APIRouter, Depends
from src.core.deps import AuthenticatedUser, get_authenticated_user

router = APIRouter()


@router.get("/me", response_model=AuthenticatedUser)
async def get_current_user(user: AuthenticatedUser = Depends(get_authenticated_user)):
    return user
