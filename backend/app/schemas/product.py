from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.category import CategoryResponse


class ProductCreateRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=200,
    )

    description: str

    price: int = Field(
        gt=0,
    )

    category_id: int = Field(
        gt=0,
    )

    stock: int = Field(
        ge=0,
    )

    sort_order: int = Field(
        ge=1,
    )

    is_active: bool = True

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "نام محصول باید حداقل ۲ کاراکتر باشد."
            )

        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        return value


class ProductUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    description: str | None = None

    price: int | None = Field(
        default=None,
        gt=0,
    )

    category_id: int | None = Field(
        default=None,
        gt=0,
    )

    stock: int | None = Field(
        default=None,
        ge=0,
    )

    sort_order: int | None = Field(
        default=None,
        ge=1,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "نام محصول باید حداقل ۲ کاراکتر باشد."
            )

        return value

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        return value


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    price: int
    image_url: str
    category: CategoryResponse
    stock: int
    sort_order: int
    is_active: bool


class ProductListResponse(BaseModel):
    data: list[ProductResponse]
    page: int
    limit: int
    total: int