# اطلاعات فنی (Technical Documentation)

> تصمیم‌های فنی پروژه: Stack، معماری، دیتابیس، ORM، Migration، ذخیره‌سازی فایل و CORS.

## ۱. Tech Stack

| لایه | انتخاب | سؤال |
|---|---|---|
| Frontend | **React + Vite** | Q17 (گزینه A) |
| Backend | **FastAPI + Python** | Q18 (گزینه A) |
| Database | **PostgreSQL** | Q19 (گزینه A) |
| ORM | **SQLAlchemy** | Q20 (گزینه A) |
| Migration | **Alembic** | Q21 (گزینه A) |
| Auth | **Session + HttpOnly Cookie** (Session در PostgreSQL) | Q6, Q8 |
| ذخیره تصاویر | **Local Storage** روی سرور | Q11 (گزینه A) |

## ۲. معماری کلی

```
React + Vite
      ↓  HTTP / JSON
FastAPI (REST API)
      ↓
SQLAlchemy ORM
      ↓
PostgreSQL
      ↑
   Alembic (Migrations)
```

## ۳. دلیل انتخاب‌ها (به‌صورت خلاصه، مطابق چت)

- **React + Vite:** ساده و مناسب یادگیری اتصال مستقیم Frontend به API (Next.js رد شد).
- **FastAPI:** با Python/FastAPI آشنایی قبلی وجود دارد و تمرکز روی معماری و API می‌ماند (Node.js + TypeScript رد شد).
- **PostgreSQL:** داده‌ها رابطه‌ای هستند (`Category 1 ─── N Product`) و Foreign Key، Constraint و Migration تمرین می‌شود (MongoDB رد شد).
- **SQLAlchemy:** کار با Model و Relationship به‌جای SQL خام (Raw SQL رد شد).
- **Alembic:** مدیریت مرحله‌ای تغییرات دیتابیس به‌جای پاک کردن و ساخت دوباره (گزینه B رد شد).

## ۴. دیتابیس

### موجودیت‌ها

```
Category
├── id
└── name  (UNIQUE)

Product
├── id
├── name
├── description
├── price         (عدد صحیح، تومان)
├── image_url
├── category_id   → Category.id
├── stock
├── sort_order
└── is_active

Admin  (یک حساب ثابت، ساخته‌شده با Seed؛ Email + Password Hash)

sessions  (در PostgreSQL)
```

> **توجه:** ساختار دقیق جدول `Admin` و `sessions` (نام و نوع فیلدها، Constraintها) در چت هنوز نهایی نشده و در مرحله **طراحی Data Model نهایی** مشخص می‌شود.
> فقط یک مثال برای فیلدهای Session در چت آمده بود (`id`, `expires_at`, `created_at`)؛ چون Session را «تا Logout» انتخاب کردید، `expires_at` احتمالاً لازم نیست، ولی این تصمیم باید در Data Model نهایی گرفته شود.

### قوانین مربوط به دیتابیس

- `Category.name` باید `UNIQUE` باشد (Q38).
- `Product.name` یکتا **نیست** (Q31).
- رابطه `Product.category_id → Category.id`؛ حذف Category دارای محصول ممنوع است (Q15).
- Product حذف نرم (`is_active`) می‌شود؛ Category حذف واقعی (Q9, Q30).
- `created_at` و `updated_at` وجود ندارند (Q36).
- Password ادمین **همیشه Hash** ذخیره می‌شود، نه متن ساده (Q26).
- ادمین اولیه و داده اولیه با Seed ساخته می‌شوند (Q26, Q27).

## ۵. مدیریت فایل تصاویر (Q10, Q11, Q37)

```
Admin
 ↓ Upload (multipart/form-data)
FastAPI
 ↓
Local Storage  →  /uploads/products/...
 ↓
image_url → PostgreSQL
```

- فایل در سیستم‌فایل Backend ذخیره می‌شود و فقط آدرس آن در دیتابیس.
- جایگزینی تصویر: ذخیره تصویر جدید → به‌روزرسانی `image_url` → حذف فایل قبلی.

## ۶. CORS (Q41 — گزینه A)

در Development دو برنامه روی دو Origin جدا اجرا می‌شوند:

```
React    → http://localhost:5173
FastAPI  → http://localhost:8000
```

- فقط Originهای Development مجاز هستند (مثل `http://localhost:5173`).
- در Production، Domain واقعی اضافه می‌شود.
- `allow_origins = ["*"]` **رد شد**، چون Auth مبتنی بر Cookie است.

## ۷. پیاده‌سازی Seed

یک اسکریپت Seed (مثلاً `seed.py`) موارد زیر را وارد می‌کند (Q26, Q27):

- Categoryهای اولیه
- ۸ محصول اولیه
- ۱ ادمین (با Password به‌صورت Hash)

## ۸. اعتبارسنجی

- Frontend Validation + Backend Validation؛ **Backend مرجع نهایی** است (Q33).
- قوانین فیلدها در `01-product-info.md` آمده است.

## ۹. روش توسعه

- کدها فایل‌به‌فایل توسط ChatGPT داده می‌شود و در VS Code کپی می‌شود.
- ترتیب مراحل: تصمیم‌ها ← Tech Stack ← Data Model ← API/Endpoint ← ساختار پروژه ← Backend ← Frontend ← اتصال ← تست ← Deploy.

## ۱۰. مراحل بعدی (طبق چت)

1. طراحی دقیق Request/Response هر Endpoint
2. طراحی Data Model نهایی (Tableها، Fieldها، Relationshipها، Constraintها)
3. ساختار پروژه و شروع کدنویسی
