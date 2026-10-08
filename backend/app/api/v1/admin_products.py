from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Path,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_admin
from app.core.database import get_db
from app.schemas.common import MessageResponse
from app.schemas.product import (
    ProductCreateRequest,
    ProductListResponse,
    ProductResponse,
)
from app.services.product_service import ProductService
from app.utils.storage import delete_product_image, save_product_image


router = APIRouter(
    prefix="/admin/products",
    tags=["Admin Products"],
)


@router.get(
    "",
    response_model=ProductListResponse,
)
async def get_admin_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    products, total = await service.list_admin_products(
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
async def get_admin_product(
    product_id: int = Path(
        ...,
        ge=1,
        description="شناسه محصول",
    ),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    return await service.get_admin_product(product_id)



@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_admin_product(
    name: str = Form(...),
    description: str = Form(...),
    price: int = Form(...),
    category_id: int = Form(...),
    stock: int = Form(...),
    sort_order: int = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    try:
        payload = ProductCreateRequest(
            name=name,
            description=description,
            price=price,
            category_id=category_id,
            stock=stock,
            sort_order=sort_order,
            is_active=is_active,
        )

        image_url = await save_product_image(image)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    service = ProductService(session)

    return await service.create_product(
        name=payload.name,
        description=payload.description,
        price=payload.price,
        image_url=image_url,
        category_id=payload.category_id,
        stock=payload.stock,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )

@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
)
async def update_admin_product(
    product_id: int = Path(..., ge=1),
    name: str | None = Form(None),
    description: str | None = Form(None),
    price: int | None = Form(None),
    category_id: int | None = Form(None),
    stock: int | None = Form(None),
    sort_order: int | None = Form(None),
    image: UploadFile | None = File(None),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    current_product = await service.get_admin_product(product_id)
    old_image_url = current_product.image_url
    new_image_url = None

    if image is not None:
        try:
            new_image_url = await save_product_image(image)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

    product = await service.update_product(
        product_id,
        name=name,
        description=description,
        price=price,
        image_url=new_image_url,
        category_id=category_id,
        stock=stock,
        sort_order=sort_order,
    )

    if new_image_url is not None:
        delete_product_image(old_image_url)

    return product


@router.delete(
    "/{product_id}",
    response_model=MessageResponse,
)
async def delete_admin_product(
    product_id: int = Path(..., ge=1),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    await service.soft_delete_product(product_id)

    return MessageResponse(
        message="محصول با موفقیت غیرفعال شد.",
    )



@router.patch(
    "/{product_id}/restore",
    response_model=MessageResponse,
)
async def restore_admin_product(
    product_id: int = Path(..., ge=1),
    _: str = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)

    await service.restore_product(product_id)

    return MessageResponse(
        message="محصول با موفقیت فعال شد.",
    )