from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)


class AdminLoginResponse(BaseModel):
    message: str


class AdminMeResponse(BaseModel):
    email: str


