from fastapi import APIRouter
from app.api.v1.admin_categories import router as admin_categories_router
from app.api.v1.products import router as products_router
from app.api.v1.categories import router as categories_router
from app.api.v1.auth import router as auth_router
from app.api.v1.admin_products import router as admin_products_router

api_router = APIRouter(
    prefix="/api/v1",
)

api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(auth_router)
api_router.include_router(admin_products_router)
api_router.include_router(admin_categories_router)