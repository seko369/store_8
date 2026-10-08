from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_admin
from app.core.database import get_db
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryResponse,
    CategoryUpdateRequest,
)
from app.schemas.common import MessageResponse
from app.services.category_service import CategoryService


router = APIRouter(
    prefix="/admin/categories",
    tags=["Admin Categories"],
)


@router.get(
    "",
    response_model=list[CategoryResponse],
)
async def get_admin_categories(
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = CategoryService(session)

    return await service.list_categories()



@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_admin_category(
    payload: CategoryCreateRequest,
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = CategoryService(session)

    return await service.create_category(
        name=payload.name,
    )






@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
)
async def update_admin_category(
    payload: CategoryUpdateRequest,
    category_id: int = Path(..., ge=1),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = CategoryService(session)

    return await service.update_category(
        category_id=category_id,
        name=payload.name,
    )



@router.delete(
    "/{category_id}",
    response_model=MessageResponse,
)
async def delete_admin_category(
    category_id: int = Path(..., ge=1),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = CategoryService(session)

    await service.delete_category(category_id)

    return MessageResponse(
        message="دسته‌بندی با موفقیت حذف شد.",
    )