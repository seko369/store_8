import { ArrowUpLeft } from "lucide-react";
import { Link } from "react-router-dom";

import type { Product } from "../types/api";
import { getAssetUrl } from "../lib/config";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-card__link"
      >
        <div className="product-card__image-wrapper">
          <img
            src={getAssetUrl(product.image_url)}
            alt={product.name}
            className="product-card__image"
          />

          <span
            className={`product-card__badge ${
              product.stock > 0
                ? ""
                : "product-card__badge--out"
            }`}
          >
            {product.stock > 0
              ? "موجود"
              : "ناموجود"}
          </span>

          <span className="product-card__arrow">
            <ArrowUpLeft size={17} />
          </span>
        </div>

        <div className="product-card__content">
          <span className="product-card__category">
            {product.category.name}
          </span>

          <h3 className="product-card__title">
            {product.name}
          </h3>

          <div className="product-card__footer">
            <strong className="product-card__price">
              {product.price.toLocaleString("fa-IR")}
              <small> تومان</small>
            </strong>
          </div>
        </div>
      </Link>
    </article>
  );
}