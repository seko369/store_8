# تصمیم‌های API (API Design Decisions)

> تصمیم‌های مربوط به طراحی REST API: ساختار URL، Response، Pagination، آپلود و رفتار عملیات.

## ۱. خلاصه تصمیم‌ها

| موضوع | تصمیم | سؤال |
|---|---|---|
| سبک API | **REST + نسخه‌بندی** (`/api/v1`) | Q22 (A) |
| محصولات در API عمومی | فقط `is_active = true` | Q23 (A) |
| جداسازی Public / Admin | Endpointهای جدا (`/api/v1/admin/...`) | Q43 (A) |
| Pagination | بله، با `page` و `limit` | Q14 (B) |
| شکل Response لیست | Object با `data` + metadata | Q42 (B) |
| Category در Response محصول | **Nested** (`category: {id, name}`) | Q44 (B) |
| ساخت محصول + آپلود تصویر | **یک Endpoint** با `multipart/form-data` | Q45 (A) |
| ویرایش محصول | **PATCH واقعی** (Partial Update) | Q46 (A) |
| حذف محصول | `DELETE` که داخل Backend Soft Delete است | Q47 (A) |
| Restore محصول | **Endpoint اختصاصی** `.../restore` | Q48 (تأییدشده در لیست نهایی Endpointها) |
| پیام خطای محصول غیرفعال | 404 + پیام فارسی | Q29 |

## ۲. ساختار URL (Q22)

- API به‌صورت **RESTful** و بر اساس **Resource** طراحی می‌شود، نه Action.
- همه مسیرها زیر `/api/v1/` هستند.

```
✅ GET    /api/v1/products
✅ POST   /api/v1/admin/products
❌ GET    /getProducts
❌ POST   /addProduct
```

## ۳. Public API در برابر Admin API (Q23, Q43)

```
PUBLIC
/api/v1/products
/api/v1/products/{id}
/api/v1/categories

ADMIN
/api/v1/admin/...
```

- Public API فقط محصولات **فعال** را برمی‌گرداند. فیلتر `is_active` سمت Backend اعمال می‌شود و منطق آن به Frontend منتقل نمی‌شود.
- Admin API همه محصولات (فعال و غیرفعال) را برمی‌گرداند.
- Authentication روی کل مسیر `/api/v1/admin` اعمال می‌شود.

## ۴. Pagination و شکل Response لیست (Q14, Q42)

درخواست:

```
GET /api/v1/products?page=1&limit=20
```

پاسخ:

```json
{
  "data": [ ... ],
  "page": 1,
  "limit": 20,
  "total": 8
}
```

- Pagination از همان ابتدا هست، حتی با ۸ محصول، تا ساختار برای رشد داده‌ها مناسب بماند.
- Response لیست‌ها یک Object قابل توسعه است، نه آرایه مستقیم.

## ۵. شکل Product در Response (Q44)

در دیتابیس فقط `category_id` ذخیره می‌شود، ولی در Response، Category به‌صورت **Nested** برمی‌گردد:

```json
{
  "id": 1,
  "name": "یخچال",
  "category": {
    "id": 3,
    "name": "لوازم سرمایشی"
  }
}
```

یعنی: **Database برای رابطه، API برای مصرف راحت Frontend.**

> فیلدهای کامل Response (مثل `price`, `stock`, `image_url`, `is_active`, `sort_order`) در مرحله طراحی دقیق Request/Response نهایی می‌شوند.

## ۶. ساخت محصول (Q45)

یک Endpoint هم اطلاعات و هم تصویر را می‌گیرد:

```
POST /api/v1/admin/products
Content-Type: multipart/form-data

 ├── name
 ├── description
 ├── price
 ├── stock
 ├── category_id
 ├── sort_order
 └── image
```

جریان در Backend: `Validate → Save image → Save Product (PostgreSQL)`

قوانین: تصویر در ساخت **اجباری** است (Q34).

## ۷. ویرایش محصول (Q35, Q37, Q46)

```
PATCH /api/v1/admin/products/{id}
Content-Type: multipart/form-data
```

- همه فیلدها **اختیاری** هستند (`name?`, `description?`, `price?`, `stock?`, `category_id?`, `sort_order?`, `image?`).
- هر فیلد ارسال‌شده تغییر می‌کند و هر فیلد ارسال‌نشده بدون تغییر می‌ماند. مثال: فقط `price = 28000000`.
- اگر `image` ارسال شود، تصویر جدید ذخیره می‌شود، `image_url` به‌روز می‌شود و **سپس** فایل قبلی حذف می‌شود.
- اگر `image` ارسال نشود، تصویر قبلی حفظ می‌شود.

## ۸. حذف و بازگردانی محصول (Q9, Q24, Q47, Q48)

```
DELETE /api/v1/admin/products/{id}
        ↓
   is_active = false        (Soft Delete)

PATCH  /api/v1/admin/products/{id}/restore
        ↓
   is_active = true
```

- از دید API عملیات «حذف» است (`DELETE`)، ولی داخل سیستم Soft Delete انجام می‌شود.
- Restore یک Endpoint اختصاصی است تا عملیات مدیریتی از ویرایش عادی جدا باشد.

> **توضیح:** در چت، ChatGPT برای Q48 (Restore) دو گزینه داد (Endpoint اختصاصی یا PATCH معمولی). شما مستقیماً A/B نگفتید، بلکه لیست Endpointها را خواستید. در لیست پیشنهادی `PATCH .../restore` وجود داشت و شما آن را **تأیید** کردید.

## ۹. حذف Category (Q15, Q30)

```
DELETE /api/v1/admin/categories/{id}
```

- Hard Delete است.
- فقط وقتی مجاز است که هیچ محصولی به آن Category متصل نباشد.
- در غیر این صورت درخواست رد می‌شود (پیام پیشنهادی در چت: «اول محصولات را جابه‌جا یا حذف کنید»).

## ۱۰. خطاها

| وضعیت | رفتار | منبع |
|---|---|---|
| محصول غیرفعال یا ناموجود در Public API | `404 Not Found` + پیام «محصول موردنظر پیدا نشد یا دیگر در فروشگاه فعال نیست.» | Q29 |
| ساخت محصول بدون تصویر | خطای `400` (در مثال چت) | Q34 |
| ورودی نامعتبر (قیمت منفی، نام خالی و ...) | رد شدن توسط Backend Validation | Q33 |
| نام Category تکراری | رد شدن (Unique) | Q38 |
| حذف Category دارای محصول | رد شدن | Q15 |

> کدهای وضعیت و فرمت دقیق بدنه خطاها هنوز نهایی نشده‌اند و در مرحله طراحی Request/Response مشخص می‌شوند.

## ۱۱. CORS

فقط Originهای Development مجاز هستند و در Production دامنه واقعی اضافه می‌شود (Q41). جزئیات در `02-technical-info.md`.
