from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.product import (
    ProductListResponse,
    ProductResponse,
)
from app.services.product_service import ProductService


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=ProductListResponse,
)
async def get_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    products, total = await service.list_public_products(
        page=page,
        limit=limit,
    )

    return ProductListResponse(
        data=products,
        page=page,
        limit=limit,
        total=total,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
async def get_product(
    product_id: int = Path(
        ...,
        ge=1,
        description="شناسه محصول",
    ),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    return await service.get_public_product(product_id)