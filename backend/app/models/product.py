from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


if TYPE_CHECKING:
    from app.models.category import Category


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    image_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey(
            "categories.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="products",
    )

    __table_args__ = (
        CheckConstraint(
            "char_length(name) >= 2",
            name="ck_products_name_min_length",
        ),
        CheckConstraint(
            "price > 0",
            name="ck_products_price_positive",
        ),
        CheckConstraint(
            "stock >= 0",
            name="ck_products_stock_non_negative",
        ),
        CheckConstraint(
            "sort_order >= 1",
            name="ck_products_sort_order_positive",
        ),
    )