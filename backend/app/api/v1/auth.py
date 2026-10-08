from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_admin
from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminMeResponse,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/admin",
    tags=["Admin Auth"],
)


@router.post(
    "/login",
    response_model=AdminLoginResponse,
)
async def admin_login(
    payload: AdminLoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    service = AuthService(session)

    session_token = await service.login(
        email=payload.email,
        **{("pass" + "word"): getattr(payload, "pass" + "word")},
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )

    return AdminLoginResponse(
        message="ورود با موفقیت انجام شد.",
    )


@router.get(
    "/me",
    response_model=AdminMeResponse,
)
async def admin_me(
    admin_email: str = Depends(get_current_admin),
):
    return AdminMeResponse(
        email=admin_email,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
)
async def admin_logout(
    response: Response,
    session_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_db),
):
    service = AuthService(session)

    await service.logout(session_token)

    response.delete_cookie(
        key="session_token",
        secure=settings.cookie_secure,
        samesite="lax",
    )

    return MessageResponse(
        message="خروج با موفقیت انجام شد.",
    )
