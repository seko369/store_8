import asyncio

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product


CATEGORIES = [
    "یخچال و فریزر",
    "ماشین لباسشویی",
    "جاروبرقی",
    "لوازم آشپزخانه",
]


PRODUCTS = [
    {
        "name": "یخچال فریزر دوقلو پارس‌خزر",
        "description": "یخچال فریزر دوقلو با فضای جادار، طراحی مدرن و مناسب برای استفاده خانوادگی.",
        "price": 48_500_000,
        "image_url": "/uploads/products/product-1.jpg",
        "category_name": "یخچال و فریزر",
        "stock": 4,
        "sort_order": 1,
        "is_active": True,
    },
    {
        "name": "یخچال فریزر سایدبای‌ساید آریا",
        "description": "یخچال سایدبای‌ساید با فضای داخلی بزرگ و طراحی مدرن برای آشپزخانه‌های امروزی.",
        "price": 72_000_000,
        "image_url": "/uploads/products/product-2.jpg",
        "category_name": "یخچال و فریزر",
        "stock": 2,
        "sort_order": 2,
        "is_active": True,
    },
    {
        "name": "ماشین لباسشویی 9 کیلویی آریانا",
        "description": "ماشین لباسشویی 9 کیلویی با برنامه‌های متنوع شست‌وشو و مصرف انرژی مناسب.",
        "price": 31_800_000,
        "image_url": "/uploads/products/product-3.jpg",
        "category_name": "ماشین لباسشویی",
        "stock": 5,
        "sort_order": 3,
        "is_active": True,
    },
    {
        "name": "ماشین لباسشویی 8 کیلویی پارس",
        "description": "ماشین لباسشویی 8 کیلویی با طراحی کاربردی و برنامه‌های متنوع برای استفاده روزمره.",
        "price": 27_500_000,
        "image_url": "/uploads/products/product-4.jpg",
        "category_name": "ماشین لباسشویی",
        "stock": 0,
        "sort_order": 4,
        "is_active": True,
    },
    {
        "name": "جاروبرقی بدون کیسه نیکا",
        "description": "جاروبرقی بدون کیسه با قدرت مکش مناسب، طراحی جمع‌وجور و استفاده آسان.",
        "price": 8_900_000,
        "image_url": "/uploads/products/product-5.jpg",
        "category_name": "جاروبرقی",
        "stock": 7,
        "sort_order": 5,
        "is_active": True,
    },
    {
        "name": "جاروبرقی رباتیک هوشمند آریا",
        "description": "جاروبرقی رباتیک هوشمند با قابلیت نظافت خودکار و مناسب برای استفاده روزمره.",
        "price": 18_500_000,
        "image_url": "/uploads/products/product-6.jpg",
        "category_name": "جاروبرقی",
        "stock": 3,
        "sort_order": 6,
        "is_active": True,
    },
    {
        "name": "سرخ‌کن بدون روغن 8 لیتری نیکا",
        "description": "سرخ‌کن بدون روغن 8 لیتری با ظرفیت مناسب برای خانواده و برنامه‌های پخت متنوع.",
        "price": 6_750_000,
        "image_url": "/uploads/products/product-7.jpg",
        "category_name": "لوازم آشپزخانه",
        "stock": 6,
        "sort_order": 7,
        "is_active": True,
    },
    {
        "name": "اسپرسوساز اتوماتیک آریانا",
        "description": "اسپرسوساز اتوماتیک با طراحی مدرن و مناسب برای تهیه انواع نوشیدنی‌های گرم.",
        "price": 14_900_000,
        "image_url": "/uploads/products/product-8.jpg",
        "category_name": "لوازم آشپزخانه",
        "stock": 1,
        "sort_order": 8,
        "is_active": True,
    },
]


async def seed_database() -> None:
    async with SessionLocal.begin() as session:

        # -------------------------
        # 1. Create Categories
        # -------------------------
        categories_by_name: dict[str, Category] = {}

        for category_name in CATEGORIES:
            result = await session.execute(
                select(Category).where(Category.name == category_name)
            )

            category = result.scalar_one_or_none()

            if category is None:
                category = Category(name=category_name)
                session.add(category)

            categories_by_name[category_name] = category

        await session.flush()

        # -------------------------
        # 2. Create Products
        # -------------------------
        products_created = 0

        for product_data in PRODUCTS:

            result = await session.execute(
                select(Product).where(
                    Product.name == product_data["name"]
                )
            )

            existing_product = result.scalar_one_or_none()

            if existing_product is not None:
                continue

            category = categories_by_name[
                product_data["category_name"]
            ]

            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                image_url=product_data["image_url"],
                category=category,
                stock=product_data["stock"],
                sort_order=product_data["sort_order"],
                is_active=product_data["is_active"],
            )

            session.add(product)
            products_created += 1

        print("Seed completed successfully.")
        print(f"Categories processed: {len(CATEGORIES)}")
        print(f"New products created: {products_created}")


if __name__ == "__main__":
    asyncio.run(seed_database())