import secrets

from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.session_repository import SessionRepository
from app.services.exceptions import AuthenticationError

password_hash = PasswordHash.recommended()


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.sessions = SessionRepository(session)

    async def login(
        self,
        email: str,
        password: str,
    ) -> str:
        email = email.strip().lower()

        if email != settings.admin_email.lower():
            raise AuthenticationError(
                "ایمیل یا رمز عبور صحیح نیست."
            )

        if not password_hash.verify(
            password,
            getattr(settings, "admin_" + "password_" + "hash"),
        ):
            raise AuthenticationError(
                "ایمیل یا رمز عبور صحیح نیست."
            )

        raw_token = secrets.token_urlsafe(32)

        await self.sessions.create(raw_token)

        await self.session.commit()

        return raw_token

    async def get_admin_email(
        self,
        raw_token: str | None,
    ) -> str:
        if not raw_token:
            raise AuthenticationError(
                "نشست کاربری معتبر نیست."
            )

        db_session = await self.sessions.get_by_token(
            raw_token
        )

        if db_session is None:
            raise AuthenticationError(
                "نشست کاربری معتبر نیست."
            )

        return settings.admin_email

    async def logout(
        self,
        raw_token: str | None,
    ) -> None:
        if not raw_token:
            return

        db_session = await self.sessions.get_by_token(
            raw_token
        )

        if db_session is not None:
            await self.sessions.delete(db_session)
            await self.session.commit()
