from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    ValidationError,
)


class ProductService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.products = ProductRepository(session)
        self.categories = CategoryRepository(session)

    async def list_public_products(
        self,
        page: int,
        limit: int,
    ) -> tuple[list[Product], int]:
        self._validate_pagination(page, limit)

        return await self.products.list_products(
            page=page,
            limit=limit,
            active_only=True,
        )

    async def list_admin_products(
        self,
        page: int,
        limit: int,
    ) -> tuple[list[Product], int]:
        self._validate_pagination(page, limit)

        return await self.products.list_products(
            page=page,
            limit=limit,
            active_only=False,
        )

    async def get_public_product(
        self,
        product_id: int,
    ) -> Product:
        product = await self.products.get_by_id(
            product_id,
            include_inactive=False,
        )

        if product is None:
            raise NotFoundError(
                "محصول موردنظر پیدا نشد یا دیگر در فروشگاه فعال نیست."
            )

        return product

    async def get_admin_product(
        self,
        product_id: int,
    ) -> Product:
        product = await self.products.get_by_id(
            product_id,
            include_inactive=True,
        )

        if product is None:
            raise NotFoundError(
                "محصول موردنظر پیدا نشد."
            )

        return product

    async def create_product(
        self,
        *,
        name: str,
        description: str,
        price: int,
        image_url: str,
        category_id: int,
        stock: int,
        sort_order: int,
        is_active: bool = True,
    ) -> Product:

        self._validate_product_data(
            name=name,
            description=description,
            price=price,
            stock=stock,
            sort_order=sort_order,
        )

        category = await self.categories.get_by_id(
            category_id
        )

        if category is None:
            raise NotFoundError(
                "دسته‌بندی موردنظر پیدا نشد."
            )

        existing_sort_order = (
            await self.products.get_by_sort_order(sort_order)
        )

        if existing_sort_order is not None:
            raise ConflictError(
                "این جایگاه نمایش قبلاً توسط محصول دیگری استفاده شده است."
            )

        product = Product(
            name=name.strip(),
            description=description.strip(),
            price=price,
            image_url=image_url,
            category_id=category_id,
            category=category,
            stock=stock,
            sort_order=sort_order,
            is_active=is_active,
        )

        await self.products.add(product)
        await self.session.commit()

        return product

    async def update_product(
        self,
        product_id: int,
        *,
        name: str | None = None,
        description: str | None = None,
        price: int | None = None,
        image_url: str | None = None,
        category_id: int | None = None,
        stock: int | None = None,
        sort_order: int | None = None,
    ) -> Product:

        product = await self.products.get_by_id(
            product_id,
            include_inactive=True,
        )

        if product is None:
            raise NotFoundError(
                "محصول موردنظر پیدا نشد."
            )

        if name is not None:
            if len(name.strip()) < 2:
                raise ValidationError(
                    "نام محصول باید حداقل ۲ کاراکتر باشد."
                )

            product.name = name.strip()

        if description is not None:
            if not description.strip():
                raise ValidationError(
                    "توضیحات محصول نمی‌تواند خالی باشد."
                )

            product.description = description.strip()

        if price is not None:
            if price <= 0:
                raise ValidationError(
                    "قیمت باید بیشتر از صفر باشد."
                )

            product.price = price

        if stock is not None:
            if stock < 0:
                raise ValidationError(
                    "موجودی نمی‌تواند منفی باشد."
                )

            product.stock = stock

        if category_id is not None:
            category = await self.categories.get_by_id(
                category_id
            )

            if category is None:
                raise NotFoundError(
                    "دسته‌بندی موردنظر پیدا نشد."
                )

            product.category_id = category_id

        if sort_order is not None:
            if sort_order < 1:
                raise ValidationError(
                    "ترتیب نمایش باید حداقل ۱ باشد."
                )

            existing = await self.products.get_by_sort_order(
                sort_order
            )

            if (
                existing is not None
                and existing.id != product.id
            ):
                raise ConflictError(
                    "این جایگاه نمایش قبلاً استفاده شده است."
                )

            product.sort_order = sort_order

        if image_url is not None:
            product.image_url = image_url

        await self.session.commit()

        return product

    async def soft_delete_product(
        self,
        product_id: int,
    ) -> Product:
        product = await self.products.get_by_id(
            product_id,
            include_inactive=True,
        )

        if product is None:
            raise NotFoundError(
                "محصول موردنظر پیدا نشد."
            )

        product.is_active = False

        await self.session.commit()

        return product

    async def restore_product(
        self,
        product_id: int,
    ) -> Product:
        product = await self.products.get_by_id(
            product_id,
            include_inactive=True,
        )

        if product is None:
            raise NotFoundError(
                "محصول موردنظر پیدا نشد."
            )

        product.is_active = True

        await self.session.commit()

        return product

    @staticmethod
    def _validate_product_data(
        *,
        name: str,
        description: str,
        price: int,
        stock: int,
        sort_order: int,
    ) -> None:

        if len(name.strip()) < 2:
            raise ValidationError(
                "نام محصول باید حداقل ۲ کاراکتر باشد."
            )

        if not description.strip():
            raise ValidationError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        if price <= 0:
            raise ValidationError(
                "قیمت باید بیشتر از صفر باشد."
            )

        if stock < 0:
            raise ValidationError(
                "موجودی نمی‌تواند منفی باشد."
            )

        if sort_order < 1:
            raise ValidationError(
                "ترتیب نمایش باید حداقل ۱ باشد."
            )

    @staticmethod
    def _validate_pagination(
        page: int,
        limit: int,
    ) -> None:

        if page < 1:
            raise ValidationError(
                "شماره صفحه باید حداقل ۱ باشد."
            )

        if limit < 1 or limit > 100:
            raise ValidationError(
                "limit باید بین ۱ تا ۱۰۰ باشد."
            )