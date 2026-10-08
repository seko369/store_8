
import { useState } from "react";
import type { FormEvent } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useCreateAdminProduct } from "../../hooks/useAdminProducts";
import { Link, useNavigate } from "react-router-dom";
export default function CreateProductPage() {
  const navigate = useNavigate();

  const categoriesQuery = useCategories();
  const createProductMutation =
    useCreateAdminProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("0");
  const [sortOrder, setSortOrder] = useState("");
  const [image, setImage] =
    useState<File | null>(null);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!image) {
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("stock", stock);
    formData.append("sort_order", sortOrder);
    formData.append("is_active", "true");
    formData.append("image", image);

    createProductMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/admin/dashboard");
      },
    });
  }

  return (
    <section className="admin-page">
      <div className="form-page__header">
        <div>
          <h1>افزودن محصول</h1>
          <p>
            اطلاعات محصول جدید را وارد کنید.
          </p>
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
            required
            minLength={2}
            maxLength={200}
          />
        </label>

        <label>
          توضیحات
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
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
              setCategoryId(event.target.value)
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
          تصویر محصول
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setImage(
                event.target.files?.[0] ?? null,
              )
            }
            required
          />
        </label>

        {categoriesQuery.isError && (
          <p className="form-error">
            دریافت دسته‌بندی‌ها ناموفق بود.
          </p>
        )}

        {createProductMutation.isError && (
          <p className="form-error">
            {createProductMutation.error instanceof Error
              ? createProductMutation.error.message
              : "ساخت محصول ناموفق بود."}
          </p>
        )}

        {!image && (
          <p className="form-hint">
            انتخاب تصویر الزامی است.
          </p>
        )}

        <button
          type="submit"
          disabled={
            createProductMutation.isPending ||
            categoriesQuery.isLoading
          }
          className="primary-button"
        >
          {createProductMutation.isPending
            ? "در حال ساخت..."
            : "ساخت محصول"}
        </button>
      </form>
    </section>
  );
}