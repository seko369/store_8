from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product


class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(
        self,
        product_id: int,
        include_inactive: bool = False,
    ) -> Product | None:
        stmt = (
            select(Product)
            .options(selectinload(Product.category))
            .where(Product.id == product_id)
        )

        if not include_inactive:
            stmt = stmt.where(Product.is_active.is_(True))

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Product | None:
        stmt = select(Product).where(Product.name == name)

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_sort_order(
        self,
        sort_order: int,
    ) -> Product | None:
        stmt = select(Product).where(
            Product.sort_order == sort_order
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_products(
        self,
        page: int,
        limit: int,
        active_only: bool = True,
    ) -> tuple[list[Product], int]:
        offset = (page - 1) * limit

        filters = []

        if active_only:
            filters.append(Product.is_active.is_(True))

        data_stmt = (
            select(Product)
            .options(selectinload(Product.category))
            .where(*filters)
            .order_by(Product.sort_order.asc())
            .offset(offset)
            .limit(limit)
        )

        count_stmt = (
            select(func.count())
            .select_from(Product)
            .where(*filters)
        )

        data_result = await self.session.execute(data_stmt)
        count_result = await self.session.execute(count_stmt)

        products = list(data_result.scalars().all())
        total = count_result.scalar_one()

        return products, total

    async def add(self, product: Product) -> Product:
        self.session.add(product)
        await self.session.flush()

        return product