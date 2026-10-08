import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCategories } from "../../hooks/useCategories";
import {
  useAdminProduct,
  useUpdateAdminProduct,
} from "../../hooks/useAdminProducts";


export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const id = Number(productId);

  const productQuery = useAdminProduct(id);
  const categoriesQuery = useCategories();
  const updateMutation =
    useUpdateAdminProduct(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [image, setImage] =
    useState<File | null>(null);

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    const product = productQuery.data;

    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategoryId(String(product.category.id));
    setStock(String(product.stock));
    setSortOrder(String(product.sort_order));
  }, [productQuery.data]);

  if (!productId || !Number.isInteger(id) || id <= 0) {
    return (
      <section className="admin-page">
        <h1>شناسه محصول نامعتبر است.</h1>
        <Link to="/admin/dashboard">
          بازگشت به داشبورد
        </Link>
      </section>
    );
  }

  if (
    productQuery.isLoading ||
    categoriesQuery.isLoading
  ) {
    return (
      <section className="admin-page">
        <p>در حال دریافت اطلاعات محصول...</p>
      </section>
    );
  }

  if (
    productQuery.isError ||
    !productQuery.data
  ) {
    return (
      <section className="admin-page">
        <h1>محصول پیدا نشد.</h1>
        <Link to="/admin/dashboard">
          بازگشت به داشبورد
        </Link>
      </section>
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append(
      "description",
      description,
    );
    formData.append("price", price);
    formData.append(
      "category_id",
      categoryId,
    );
    formData.append("stock", stock);
    formData.append(
      "sort_order",
      sortOrder,
    );

    if (image) {
      formData.append("image", image);
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/admin/dashboard");
      },
    });
  }

  return (
    <section className="admin-page">
      <div className="form-page__header">
        <div>
          <h1>ویرایش محصول</h1>
          <p>{productQuery.data.name}</p>
        </div>

        <Link
          to="/admin/dashboard"
          className="secondary-button"
        >
          بازگشت
        </Link>
      </div>

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >
        <label>
          نام محصول
          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            minLength={2}
            maxLength={200}
            required
          />
        </label>

        <label>
          توضیحات
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            required
          />
        </label>

        <label>
          قیمت
          <input
            type="number"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            min={1}
            required
          />
        </label>

        <label>
          دسته‌بندی
          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value,
              )
            }
            required
          >
            <option value="">
              انتخاب دسته‌بندی
            </option>

            {categoriesQuery.data?.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          موجودی
          <input
            type="number"
            value={stock}
            onChange={(event) =>
              setStock(event.target.value)
            }
            min={0}
            required
          />
        </label>

        <label>
          ترتیب نمایش
          <input
            type="number"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value)
            }
            min={1}
            required
          />
        </label>

        <label>
          تصویر جدید
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setImage(
                event.target.files?.[0] ?? null,
              )
            }
          />
        </label>

        {updateMutation.isError && (
          <p className="form-error">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "ویرایش محصول ناموفق بود."}
          </p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending
            ? "در حال ذخیره..."
            : "ذخیره تغییرات"}
        </button>
      </form>
    </section>
  );
}