from pydantic import BaseModel, Field


class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int


class MessageResponse(BaseModel):
    message: str


class PaginationQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)