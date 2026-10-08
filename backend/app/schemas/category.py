from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryCreateRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد."
            )

        return value


class CategoryUpdateRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد."
            )

        return value


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str