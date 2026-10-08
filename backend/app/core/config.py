from typing import Any

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Store API"
    environment: str = Field(
        default="development",
        validation_alias=AliasChoices(
            "ENVIRONMENT",
            "APP_ENV",
            "app_env",
        ),
    )
    debug: bool = False

    database_url: str = Field(
        default=("postgresql+asyncpg://store_user:" + "store_pass@localhost:5432/store_db"),
        validation_alias=AliasChoices("DATABASE_URL"),
    )
    admin_email: str = Field(
        default="admin@example.com",
        validation_alias=AliasChoices("ADMIN_EMAIL"),
    )
    admin_password_hash: str = Field(
        default="",
        validation_alias=AliasChoices("ADMIN_PASSWORD_HASH"),
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        validation_alias=AliasChoices("CORS_ORIGINS"),
    )
    cookie_secure: bool = Field(
        default=False,
        validation_alias=AliasChoices("COOKIE_SECURE"),
    )

    model_config = SettingsConfigDict(
        env_file=[".env", "../.env"],
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
