from fastapi import Cookie, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth_service import AuthService


async def get_current_admin(
    session_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_db),
) -> str:
    service = AuthService(session)

    return await service.get_admin_email(session_token)