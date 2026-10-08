from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    ValidationError,
)


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.categories = CategoryRepository(session)

    async def list_categories(self) -> list[Category]:
        return await self.categories.list_all()

    async def create_category(
        self,
        name: str,
    ) -> Category:

        name = name.strip()

        if len(name) < 2:
            raise ValidationError(
                "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد."
            )

        existing = await self.categories.get_by_name(name)

        if existing is not None:
            raise ConflictError(
                "این دسته‌بندی قبلاً وجود دارد."
            )

        category = Category(name=name)

        await self.categories.add(category)
        await self.session.commit()

        return category

    async def update_category(
        self,
        category_id: int,
        name: str,
    ) -> Category:

        category = await self.categories.get_by_id(
            category_id
        )

        if category is None:
            raise NotFoundError(
                "دسته‌بندی موردنظر پیدا نشد."
            )

        name = name.strip()

        if len(name) < 2:
            raise ValidationError(
                "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد."
            )

        existing = await self.categories.get_by_name(name)

        if (
            existing is not None
            and existing.id != category.id
        ):
            raise ConflictError(
                "این نام دسته‌بندی قبلاً استفاده شده است."
            )

        category.name = name

        await self.session.commit()

        return category

    async def delete_category(
        self,
        category_id: int,
    ) -> None:

        category = await self.categories.get_by_id(
            category_id
        )

        if category is None:
            raise NotFoundError(
                "دسته‌بندی موردنظر پیدا نشد."
            )

        has_products = await self.categories.has_products(
            category_id
        )

        if has_products:
            raise ConflictError(
                "این دسته‌بندی دارای محصول است و قابل حذف نیست."
            )

        await self.categories.delete(category)
        await self.session.commit()