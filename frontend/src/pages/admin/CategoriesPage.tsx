import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import type { Category } from "../../types/api";

import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "../../hooks/useAdminCategories";


export default function CategoriesPage() {
  const categoriesQuery = useAdminCategories();

  const createMutation =
    useCreateAdminCategory();

  const updateMutation =
    useUpdateAdminCategory();

  const deleteMutation =
    useDeleteAdminCategory();

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const name = newCategoryName.trim();

    if (!name) {
      setErrorMessage(
        "نام دسته‌بندی را وارد کنید.",
      );
      return;
    }

    createMutation.mutate(name, {
      onSuccess: () => {
        setNewCategoryName("");
      },

      onError: (error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "ساخت دسته‌بندی ناموفق بود.",
        );
      },
    });
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setErrorMessage("");
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingName("");
  }

  function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (editingCategoryId === null) {
      return;
    }

    setErrorMessage("");

    const name = editingName.trim();

    if (!name) {
      setErrorMessage(
        "نام دسته‌بندی را وارد کنید.",
      );
      return;
    }

    updateMutation.mutate(
      {
        categoryId: editingCategoryId,
        name,
      },
      {
        onSuccess: () => {
          cancelEditing();
        },

        onError: (error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "ویرایش دسته‌بندی ناموفق بود.",
          );
        },
      },
    );
  }

  function handleDelete(
    categoryId: number,
  ) {
    const confirmed = window.confirm(
      "آیا از حذف این دسته‌بندی مطمئن هستید؟",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    deleteMutation.mutate(categoryId, {
      onError: (error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "حذف دسته‌بندی ناموفق بود.",
        );
      },
    });
  }

  if (categoriesQuery.isLoading) {
    return (
      <section className="admin-page">
        <p>در حال دریافت دسته‌بندی‌ها...</p>
      </section>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <section className="admin-page">
        <h1>دسته‌بندی‌ها</h1>

        <p className="form-error">
          {categoriesQuery.error instanceof Error
            ? categoriesQuery.error.message
            : "دریافت دسته‌بندی‌ها ناموفق بود."}
        </p>
      </section>
    );
  }

  if (!categoriesQuery.data) {
    return (
      <section className="admin-page">
        <h1>دسته‌بندی‌ها</h1>

        <p>
          دسته‌بندی‌ای برای نمایش وجود ندارد.
        </p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="form-page__header">
        <div>
          <h1>دسته‌بندی‌ها</h1>

          <p>
            مدیریت دسته‌بندی‌های فروشگاه
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
        className="category-create-form"
        onSubmit={handleCreate}
      >
        <label>
          دسته‌بندی جدید

          <input
            value={newCategoryName}
            onChange={(event) =>
              setNewCategoryName(
                event.target.value,
              )
            }
            placeholder="مثلاً تلویزیون"
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <button
          type="submit"
          className="primary-button"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending
            ? "در حال ساخت..."
            : "افزودن دسته‌بندی"}
        </button>
      </form>

      {errorMessage && (
        <p className="form-error category-page-error">
          {errorMessage}
        </p>
      )}

      <div className="category-list">
        {categoriesQuery.data.length === 0 ? (
          <p>دسته‌بندی‌ای وجود ندارد.</p>
        ) : (
          categoriesQuery.data.map(
            (category) => (
              <div
                key={category.id}
                className="category-item"
              >
                {editingCategoryId === category.id ? (
                  <form
                    className="category-edit-form"
                    onSubmit={handleUpdate}
                  >
                    <input
                      value={editingName}
                      onChange={(event) =>
                        setEditingName(
                          event.target.value,
                        )
                      }
                      minLength={2}
                      maxLength={100}
                      required
                    />

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        updateMutation.isPending
                      }
                    >
                      ذخیره
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={cancelEditing}
                    >
                      لغو
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="category-item__name">
                      {category.name}
                    </span>

                    <div className="category-item__actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          startEditing(category)
                        }
                      >
                        ویرایش
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        disabled={
                          deleteMutation.isPending
                        }
                        onClick={() =>
                          handleDelete(
                            category.id,
                          )
                        }
                      >
                        حذف
                      </button>
                    </div>
                  </>
                )}
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}
