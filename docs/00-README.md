# مستندات پروژه: فروشگاه لوازم خانگی

مستندات تصمیم‌های پروژه که از چت «توضیح متدهای HTTP» (۴۸ سؤال و جواب با ChatGPT) استخراج شده است.

## خلاصه پروژه

یک فروشگاه Full-Stack تمرینی با ۸ محصول اولیه، Landing Page برای مشتری و پنل ادمین برای مدیریت محصولات و دسته‌بندی‌ها. فعلاً خرید و پرداخت ندارد.

```
React + Vite  →  FastAPI  →  SQLAlchemy  →  PostgreSQL  (+ Alembic)
```

## فایل‌ها

| فایل | محتوا |
|---|---|
| [01-product-info.md](01-product-info.md) | نقش‌ها، مدل Product و Category، قوانین کسب‌وکار، صفحات |
| [02-technical-info.md](02-technical-info.md) | Tech Stack، معماری، دیتابیس، ذخیره تصاویر، CORS |
| [03-auth-and-security.md](03-auth-and-security.md) | ورود ادمین، Session، Cookie، Logout |
| [04-api-decisions.md](04-api-decisions.md) | تصمیم‌های طراحی API: REST، Pagination، Response، آپلود |
| [05-endpoints.md](05-endpoints.md) | لیست ۱۶ Endpoint تأییدشده |
| [06-decision-log.md](06-decision-log.md) | جدول همه ۴۸ سؤال و انتخاب‌ها به ترتیب چت |

## تصمیم‌های کلیدی در یک نگاه

- **نقش‌ها:** مشتری + یک ادمین ثابت
- **Auth:** Session + HttpOnly Cookie، ذخیره Session در PostgreSQL، اعتبار تا Logout
- **محصول:** `id, name, description, price (تومان، عدد صحیح), image_url, category_id, stock, sort_order, is_active`
- **حذف:** محصول → Soft Delete + Restore؛ Category → Hard Delete (فقط بدون محصول)
- **تصویر:** آپلود روی Local Storage، اجباری در ساخت، اختیاری در ویرایش
- **API:** REST زیر `/api/v1`، Public و Admin جدا، Pagination، Response به‌شکل `{data, page, limit, total}`
- **Landing Page:** فقط نمایش محصولات فعال بر اساس `sort_order`، بدون Search/Filter

## وضعیت و گام‌های بعدی

انجام‌شده: تصمیم‌های محصول، Stack، Auth، API و لیست Endpointها.

طبق چت، گام‌های بعدی:

1. طراحی دقیق Request/Response هر Endpoint
2. طراحی Data Model نهایی (Tableها، Fieldها، Constraintها)
3. ساختار پروژه و شروع کدنویسی فایل‌به‌فایل

## نکته

اگر در حین ساخت پروژه تصمیمی عوض شد، همین فایل‌ها را به‌روز کنید و شماره سؤال (`Q..`) را در `06-decision-log.md` اصلاح کنید.
