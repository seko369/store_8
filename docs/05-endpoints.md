# Endpointها (API Endpoints)

> لیست نهایی و تأییدشده‌ی **۱۶ Endpoint** نسخه اول پروژه.
> Base URL: `/api/v1`
> این لیست در چت پیشنهاد و توسط شما با «تاییده» تأیید شد. از اینجا به بعد Endpoint جدیدی اضافه نمی‌شود مگر نیاز واقعی مشخص شود.

## نمای کلی

```
/api/v1
│
├── /products
│   ├── GET
│   └── GET /{id}
│
├── /categories
│   └── GET
│
└── /admin
    │
    ├── /login
    ├── /logout
    ├── /me
    │
    ├── /products
    │   ├── GET
    │   ├── POST
    │   ├── GET /{id}
    │   ├── PATCH /{id}
    │   ├── DELETE /{id}
    │   └── PATCH /{id}/restore
    │
    └── /categories
        ├── GET
        ├── POST
        ├── PATCH /{id}
        └── DELETE /{id}
```

## ۱. Public API (مشتری) — بدون Login

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/v1/products` | لیست محصولات **فعال** با Pagination (`?page=1&limit=20`)، مرتب‌شده با `sort_order ASC` |
| GET | `/api/v1/products/{id}` | جزئیات یک محصول فعال؛ اگر غیرفعال یا نامعتبر باشد → 404 |
| GET | `/api/v1/categories` | لیست دسته‌بندی‌ها برای استفاده در سایت |

> `GET /api/v1/categories` را ChatGPT اضافه کرد و خودش اشاره کرد که چون Landing Page فعلاً فیلتر ندارد، الزام قطعی نیست و در صورت تمایل می‌شود حذفش کرد. شما لیست را همراه با آن تأیید کردید.

## ۲. Admin — احراز هویت

| متد | مسیر | توضیح |
|---|---|---|
| POST | `/api/v1/admin/login` | ورود با Email + Password و ساخت Session (Cookie) |
| POST | `/api/v1/admin/logout` | حذف Session از PostgreSQL + پاک کردن HttpOnly Cookie |
| GET | `/api/v1/admin/me` | بررسی اینکه ادمین Login است یا نه |

## ۳. Admin — محصولات (نیازمند Login)

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/v1/admin/products` | همه محصولات (فعال و غیرفعال) با Pagination |
| POST | `/api/v1/admin/products` | ساخت محصول + آپلود تصویر در یک Request (`multipart/form-data`) |
| GET | `/api/v1/admin/products/{id}` | جزئیات محصول برای ادمین، حتی اگر غیرفعال باشد |
| PATCH | `/api/v1/admin/products/{id}` | ویرایش Partial؛ هر فیلدِ ارسال‌شده تغییر می‌کند و تصویر جدید در صورت ارسال جایگزین می‌شود |
| DELETE | `/api/v1/admin/products/{id}` | Soft Delete ← `is_active = false` |
| PATCH | `/api/v1/admin/products/{id}/restore` | بازگرداندن محصول ← `is_active = true` |

## ۴. Admin — دسته‌بندی‌ها (نیازمند Login)

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/v1/admin/categories` | لیست دسته‌بندی‌ها |
| POST | `/api/v1/admin/categories` | ساخت Category (نام باید یکتا باشد) |
| PATCH | `/api/v1/admin/categories/{id}` | ویرایش Category |
| DELETE | `/api/v1/admin/categories/{id}` | حذف واقعی؛ فقط اگر محصولی به آن متصل نباشد |

## ۵. شمارش

| گروه | تعداد |
|---|---|
| Public | ۳ |
| Admin Auth | ۳ |
| Admin Products | ۶ |
| Admin Categories | ۴ |
| **جمع** | **۱۶** |

## ۶. وضعیت طراحی

این سند فقط **لیست Endpointها** را ثبت می‌کند. موارد زیر هنوز طراحی نشده‌اند و گام بعدی طبق چت هستند:

- بدنه Request و Response هر Endpoint
- کدهای وضعیت و فرمت خطاها
- Data Model نهایی

نمونه شکل Response لیست و Product در `04-api-decisions.md` آمده است.
