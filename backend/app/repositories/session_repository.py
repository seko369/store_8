import hashlib

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import SessionModel


class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        raw_token: str,
    ) -> SessionModel:
        token_hash = hashlib.sha256(
            raw_token.encode("utf-8")
        ).hexdigest()

        db_session = SessionModel(
            session_token_hash=token_hash,
        )

        self.session.add(db_session)
        await self.session.flush()

        return db_session

    async def get_by_token(
        self,
        raw_token: str,
    ) -> SessionModel | None:
        token_hash = hashlib.sha256(
            raw_token.encode("utf-8")
        ).hexdigest()

        stmt = select(SessionModel).where(
            SessionModel.session_token_hash == token_hash
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def delete(
        self,
        db_session: SessionModel,
    ) -> None:
        await self.session.delete(db_session)
        await self.session.flush()