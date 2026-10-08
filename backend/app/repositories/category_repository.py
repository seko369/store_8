from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.product import Product


class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(
        self,
        category_id: int,
    ) -> Category | None:
        stmt = select(Category).where(
            Category.id == category_id
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        name: str,
    ) -> Category | None:
        stmt = select(Category).where(
            Category.name == name
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Category]:
        stmt = select(Category).order_by(Category.id.asc())

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def has_products(
        self,
        category_id: int,
    ) -> bool:
        stmt = select(
            exists().where(
                Product.category_id == category_id
            )
        )

        result = await self.session.execute(stmt)

        return bool(result.scalar())

    async def add(self, category: Category) -> Category:
        self.session.add(category)
        await self.session.flush()

        return category

    async def delete(self, category: Category) -> None:
        await self.session.delete(category)
        await self.session.flush()