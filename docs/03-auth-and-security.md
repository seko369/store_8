# احراز هویت و امنیت (Auth & Security)

> تصمیم‌های مربوط به ورود ادمین، Session، Cookie و دسترسی‌ها.

## ۱. خلاصه تصمیم‌ها

| موضوع | تصمیم | سؤال |
|---|---|---|
| نیاز به Login برای `/admin` | بله، **Session + HttpOnly Cookie** (نه JWT، نه بدون Login) | Q6 (گزینه C) |
| تعداد ادمین | **فقط یک ادمین ثابت** | Q7 (گزینه A) |
| محل ذخیره Session | **PostgreSQL** (نه Redis) | Q8 (گزینه A) |
| ساخت ادمین اولیه | با **Seed** داخل Database | Q26 (گزینه B) |
| ذخیره Password | **فقط Hash**، نه متن ساده | Q26 |
| اعتبار Session | **تا زمان Logout** (بدون انقضای زمانی) | Q39 (گزینه C) |
| Logout | حذف Session + پاک کردن Cookie از Browser | Q40 (گزینه B) |
| جداسازی APIها | Public و Admin کاملاً جدا | Q43 (گزینه A) |
| CORS | فقط Originهای Development؛ در Production دامنه واقعی | Q41 (گزینه A) |

## ۲. جریان ورود (Login Flow)

```
Admin
 ↓
Login (Email + Password)
 ↓
Backend → بررسی Password (Hash)
 ↓
ساخت Session در PostgreSQL
 ↓
ارسال session_id داخل HttpOnly Cookie
 ↓
Admin Panel
```

- Session سمت Backend نگهداری می‌شود و فقط شناسه آن داخل Cookie امن به مرورگر داده می‌شود.
- تمام مسیرهای `/api/v1/admin/...` (به‌جز `login`) باید Authentication داشته باشند، چون APIهای Admin جدا از Public هستند.

## ۳. جریان خروج (Logout Flow) (Q40)

```
POST /api/v1/admin/logout
        ↓
Delete Session (از PostgreSQL)
        +
Set-Cookie → حذف Cookie از Browser
```

## ۴. Session بدون انقضا (Q39)

انتخاب Session تا Logout یعنی Session فیلد انقضای زمانی ندارد و فقط با Logout باطل می‌شود.

> **نکته امنیتی ذکرشده در چت:** اگر Session دزدیده شود، تا زمانی که Logout یا باطل شدن آن اتفاق نیفتد معتبر می‌ماند. برای پروژه تمرینی قابل قبول دانسته شد.

## ۵. حساب ادمین (Q7, Q26)

- فقط یک حساب ادمین وجود دارد؛ `User` و `role` ساخته نمی‌شود.
- حساب با Seed ساخته می‌شود (`seed.py`).
- Password به‌صورت Hash در دیتابیس ذخیره می‌شود.

## ۶. دلیل‌های انتخاب (خلاصه)

- **Session + Cookie به‌جای JWT:** مفاهیم Session و Cookie در عمل تمرین می‌شود.
- **PostgreSQL به‌جای Redis:** چون فقط یک ادمین داریم و وابستگی پروژه بی‌دلیل زیاد نمی‌شود.
- **CORS محدود:** چون Auth مبتنی بر Cookie است، باز گذاشتن همه Originها مناسب نیست.

## ۷. تصمیم‌های نگرفته‌شده

این موارد در چت مشخص نشده‌اند:

- الگوریتم Hash کردن Password
- نام Cookie و تنظیمات آن (`SameSite`، `Secure` و ...)
- محافظت در برابر CSRF
- Rate limit برای Login
