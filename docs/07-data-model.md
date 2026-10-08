# Data Model نهایی (Database Design)

> تصمیم‌های مرحله «طراحی Data Model نهایی» که بعد از تأیید Endpointها گرفته شد.
> سؤال‌های این مرحله با پیشوند `DM-Q` شماره‌گذاری شده‌اند (جدا از `Q..` در `06-decision-log.md`).
> در پایان، ۱۸ پیشنهاد باقی‌مانده و ۵ تصمیم آخر را با پیام «با تصمیماتت موافق هستم» تأیید کردی؛ این‌ها با پیشوند `R` آمده‌اند.

## ۱. خلاصه

فقط **سه جدول** داریم:

```
┌──────────────────────┐
│ categories           │
├──────────────────────┤
│ id          PK       │
│ name        UNIQUE   │
└──────────┬───────────┘
           │ 1 : N
┌──────────▼───────────┐
│ products             │
├──────────────────────┤
│ id          PK       │
│ name                 │
│ description          │
│ price                │
│ image_url            │
│ category_id FK       │
│ stock                │
│ sort_order  UNIQUE   │
│ is_active            │
└──────────────────────┘

┌──────────────────────────┐
│ sessions                 │
├──────────────────────────┤
│ id          PK           │
│ session_token_hash UNIQUE│
│ created_at               │
└──────────────────────────┘
```

- **جدول `admins` وجود ندارد.** ایمیل و Hash رمز ادمین در Environment/Config است (DM-Q1, DM-Q10).
- `sessions` با هیچ جدول دیگری رابطه ندارد.
- نام جدول‌ها lowercase و جمع است (R2).
- همه `id`ها **Integer** و Auto Increment هستند (DM-Q4, R3).

## ۲. جدول `products`

| فیلد | نوع | محدودیت‌ها | منبع |
|---|---|---|---|
| `id` | INTEGER | PK، Auto Increment | DM-Q4 |
| `name` | VARCHAR(200) | NOT NULL؛ طول ۲ تا ۲۰۰ کاراکتر (حداقل ۲ در Validation)؛ **تکراری مجاز** | DM-Q5, R6 |
| `description` | TEXT | NOT NULL؛ رشته خالی در Backend رد می‌شود | DM-Q5, R10 |
| `price` | INTEGER | NOT NULL، `CHECK (price > 0)`، واحد: تومان | DM-Q7, R11 |
| `image_url` | VARCHAR(500) | NOT NULL، **مسیر نسبی** مثل `/uploads/products/fridge-123.jpg` | DM-Q6, R8 |
| `category_id` | INTEGER | NOT NULL، FK → `categories.id`، `ON DELETE RESTRICT` | DM-Q8, DM-Q9, R15 |
| `stock` | INTEGER | NOT NULL، `DEFAULT 0`، `CHECK (stock >= 0)` | DM-Q11 |
| `sort_order` | INTEGER | NOT NULL، `DEFAULT 1`، `CHECK (sort_order >= 1)`، **UNIQUE** | DM-Q12, DM-Q16, R12, R16 |
| `is_active` | BOOLEAN | NOT NULL، `DEFAULT true` | DM-Q13 |

### نکات

- **`name` و `description`:** `description` از نوع TEXT است تا محدودیت ثابت طول نداشته باشد؛ کنترل ورودی در API انجام می‌شود (DM-Q5 — گزینه A).
- **`image_url`:** مسیر نسبی ذخیره می‌شود، نه URL کامل، تا Database به Domain یا Port وابسته نشود (DM-Q6).
- **`price`:** نوع INTEGER کافی است و BIGINT لازم نیست (DM-Q7).
- **`category_id`:** Database هم مثل Backend حذف Category دارای محصول را رد می‌کند (DM-Q8).
- **`is_active`:** محصول تازه‌ساخته‌شده بلافاصله فعال است و در Landing Page نمایش داده می‌شود (DM-Q13).
- **`sort_order`:**
  - از ۱ شروع می‌شود (DM-Q12).
  - **روی همه محصولات یکتا است، حتی غیرفعال‌ها** (R16 — گزینه A). Partial Unique Index (فقط برای فعال‌ها) رد شد.
  - بعد از حذف یک محصول، بقیه Reorder نمی‌شوند؛ فاصله در شماره‌ها مجاز است (مثل `1, 2, 4`) (R12).
- **بدون `created_at` و `updated_at`** برای Product و Category (R18).
- **Soft Delete:** فایل تصویر هنگام Soft Delete **پاک نمی‌شود**، چون محصول Restore می‌شود (R17).

## ۳. جدول `categories`

| فیلد | نوع | محدودیت‌ها | منبع |
|---|---|---|---|
| `id` | INTEGER | PK، Auto Increment | DM-Q4 |
| `name` | VARCHAR(100) | NOT NULL، **UNIQUE** | DM-Q3, R7 |

- ساده می‌ماند: **بدون `sort_order`** برای Category (DM-Q3 — گزینه A).
- Hard Delete است و فقط وقتی مجاز است که محصولی به آن وصل نباشد.

## ۴. جدول `sessions`

| فیلد | نوع | محدودیت‌ها | منبع |
|---|---|---|---|
| `id` | INTEGER | PK، Auto Increment | DM-Q4, R3 |
| `session_token_hash` | VARCHAR(64) | NOT NULL، **UNIQUE** | DM-Q14, DM-Q15, R1 |
| `created_at` | TIMESTAMP | NOT NULL، `DEFAULT CURRENT_TIMESTAMP` (ثبت توسط خود PostgreSQL) | DM-Q17 |

### نحوه کار Session Token

```
Login
  ↓
Backend یک Token تصادفی می‌سازد
  ↓
Token خام  →  داخل HttpOnly Cookie (مرورگر)
Hash(Token) →  ستون session_token_hash در PostgreSQL

درخواست بعدی:
Cookie → Hash → مقایسه با session_token_hash
```

- **Token خام در دیتابیس ذخیره نمی‌شود** (DM-Q15 — گزینه B)؛ اگر دیتابیس لو برود، مقدار آن مستقیماً برای Login قابل استفاده نیست.
- الگوریتم Hash: **SHA-256** و ذخیره به‌صورت hex، یعنی ۶۴ کاراکتر (R1).
- **بدون `expires_at`**، چون Session تا Logout معتبر است.
- **Logout:** رکورد Session حذف می‌شود (`DELETE FROM sessions`)؛ برای Sessionهای Logoutشده چیزی باقی نمی‌ماند (R4).
- **بدون Cleanup Scheduler**، چون Session منقضی‌شده نداریم (R5).

## ۵. Indexها (R13, R14)

| Index | نوع | کاربرد |
|---|---|---|
| `products.category_id` | INDEX | `WHERE category_id = ?` |
| `products(is_active, sort_order)` | INDEX ترکیبی | لیست Landing Page و Pagination: `WHERE is_active = true ORDER BY sort_order LIMIT ... OFFSET ...` |
| `categories.name` | UNIQUE INDEX | یکتا بودن نام |
| `sessions.session_token_hash` | UNIQUE INDEX | پیدا کردن Session با Hash توکن |

## ۶. ادمین و Seed

### حساب ادمین (DM-Q1, DM-Q10)

حساب ادمین جدول ندارد و از Environment خوانده می‌شود:

```
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
        ↓
   FastAPI Auth (Login)
```

> در چت یک **تناقض** پیدا شد: تصمیم قبلی «ادمین با `seed.py` ساخته شود» با «جدول Admin نداریم» سازگار نبود. با انتخاب A (Environment/Config) حل شد و تصمیم قبلی لغو شد.

### Seed (`seed.py`)

فقط این دو مورد را می‌سازد:

```
seed.py
├── Categories
└── 8 Products
```

## ۷. قوانین فایل تصویر (R9)

این قوانین در Backend اعمال می‌شوند و Database فقط `image_url` را نگه می‌دارد:

- فرمت‌های مجاز: **JPEG, PNG, WEBP**
- حداکثر حجم: **۵MB** (در چت با «مثلاً» ذکر شد)

## ۸. قوانین Business که در Data Model منعکس شده‌اند

```
Product
├── Delete  → Soft Delete (is_active = false)
├── Restore → is_active = true
├── نام تکراری مجاز
├── تصویر هنگام Create اجباری
└── در Edit تصویر اختیاری

Category
├── نام باید Unique باشد
└── اگر Product داشته باشد → Delete ممنوع (RESTRICT)

Customer → فقط Productهای Active را می‌بیند
Admin    → همه Productها را می‌بیند
```

## ۹. خارج از محدوده نسخه اول

`orders`، `cart`، `payments`، `reviews`، `favorites`، جدول `users`، Redis، Object Storage، Elasticsearch، Microservices.

## ۱۰. نمونه SQL معادل

> فقط برای فهم ساختار است. دیتابیس واقعی با SQLAlchemy Model و Alembic ساخته می‌شود.

```sql
CREATE TABLE categories (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    description  TEXT NOT NULL,
    price        INTEGER NOT NULL CHECK (price > 0),
    image_url    VARCHAR(500) NOT NULL,
    category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sort_order   INTEGER NOT NULL DEFAULT 1 CHECK (sort_order >= 1) UNIQUE,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX ix_products_category_id ON products (category_id);
CREATE INDEX ix_products_is_active_sort_order ON products (is_active, sort_order);

CREATE TABLE sessions (
    id                  SERIAL PRIMARY KEY,
    session_token_hash  VARCHAR(64) NOT NULL UNIQUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## ۱۱. نکته‌های اجرایی (در چت بررسی نشده‌اند)

این دو مورد نتیجه ترکیب تصمیم‌های بالا هستند و هنگام کدنویسی باید درباره‌شان تصمیم بگیری:

1. **`sort_order` هم `UNIQUE` است و هم `DEFAULT 1`.** اگر ادمین محصول دوم را بدون مشخص کردن `sort_order` بسازد، مقدار پیش‌فرض ۱ با محصول اول تداخل می‌کند. Backend باید خودش مقدار مناسب بدهد (مثلاً بیشترین مقدار فعلی + ۱) یا آن را از ادمین بگیرد.
2. **جابه‌جایی ترتیب دو محصول** با قید UNIQUE ساده نیست. تغییر مستقیم دو مقدار به یکدیگر در دو UPDATE جدا با خطای یکتایی روبه‌رو می‌شود و به یک مقدار موقت یا قید Deferrable نیاز دارد.

## ۱۲. تغییرات نسبت به مستندات قبلی

| موضوع | قبلاً | حالا |
|---|---|---|
| حساب ادمین | با Seed در Database ساخته می‌شود | Environment/Config؛ جدول Admin نداریم |
| محتوای Seed | Categories + ۸ Products + ۱ Admin | Categories + ۸ Products |
| `sort_order` | عدد صحیح ≥ ۰ | عدد صحیح ≥ ۱ و **یکتا** |
| `is_active` | بدون مقدار پیش‌فرض مشخص | `DEFAULT true` |
| Session | ساختار نهایی نبود | `id`, `session_token_hash` (SHA-256)، `created_at`؛ بدون `expires_at` |

## ۱۳. گام بعدی (طبق چت)

Data Model قفل شد و دست‌نخورده می‌ماند مگر اینکه هنگام پیاده‌سازی نیاز واقعی پیدا شود. مرحله بعد **طراحی ساختار پروژه** است، یعنی تعیین Folderها و Fileها و مسئولیت هرکدام قبل از شروع کپی کدها در VS Code.

## ضمیمه: همه تصمیم‌های این مرحله

### سؤال‌هایی که خودت جواب دادی

| # | موضوع | انتخاب شما |
|---|---|---|
| DM-Q1 | ساختار Admin | **B** — جدول Admin نداشته باشیم |
| DM-Q2 | فیلدهای Session | **A** — `id`, `session_token`, `created_at` (بعداً توکن به Hash تبدیل شد) |
| DM-Q3 | جدول Category | **A** — `id`, `name` (ساده) |
| DM-Q4 | نوع id | **A** — Integer |
| DM-Q5 | `name` و `description` | **A** — name: String، description: Text |
| DM-Q6 | `image_url` | **A** — مسیر نسبی |
| DM-Q7 | نوع `price` | **A** — INTEGER |
| DM-Q8 | رابطه Product و Category | **A** — RESTRICT |
| DM-Q9 | `category_id` | **A** — NOT NULL |
| DM-Q10 | منبع ادمین (رفع تناقض) | **A** — Environment/Config |
| DM-Q11 | `stock` | **A** — INTEGER، NOT NULL، `>= 0`، default 0 |
| DM-Q12 | `sort_order` | **A** — از ۱ شروع شود |
| DM-Q13 | پیش‌فرض `is_active` | **A** — Active |
| DM-Q14 | `session_token` | **A** — UNIQUE و NOT NULL |
| DM-Q15 | ذخیره Token | **B** — Hash ذخیره شود |
| DM-Q16 | تکراری بودن `sort_order` | **A** — یکتا |
| DM-Q17 | `created_at` در Session | **A** — ثبت خودکار توسط PostgreSQL |

### پیشنهادهای تأییدشده (با «با تصمیماتت موافق هستم»)

| # | موضوع | تصمیم |
|---|---|---|
| R1 | نوع `session_token_hash` | SHA-256 + `VARCHAR(64)`، UNIQUE، NOT NULL |
| R2 | نام جدول‌ها | `products`, `categories`, `sessions` |
| R3 | `sessions.id` | INTEGER، PK، Auto Increment |
| R4 | `created_at` برای Sessionهای Logoutشده | Session حذف می‌شود؛ تصمیم جدیدی لازم نیست |
| R5 | پاک‌سازی خودکار Session | نداریم |
| R6 | طول `name` محصول | `VARCHAR(200)`، اعتبارسنجی ۲ تا ۲۰۰ |
| R7 | طول `Category.name` | `VARCHAR(100)`، NOT NULL، UNIQUE |
| R8 | نوع `image_url` | `VARCHAR(500)`، NOT NULL |
| R9 | محدودیت فایل تصویر | JPEG, PNG, WEBP؛ حداکثر ۵MB |
| R10 | `description` | TEXT، NOT NULL؛ رشته خالی در Backend رد شود |
| R11 | `price` | `CHECK (price > 0)` در Database هم باشد |
| R12 | `sort_order` بعد از حذف | Reorder نمی‌شود؛ فاصله مجاز است |
| R13 | Indexها | چهار Index جدول بخش ۵ |
| R14 | Pagination و Index | Index ترکیبی `(is_active, sort_order)` |
| R15 | رفتار حذف Category | `ON DELETE RESTRICT` |
| R16 | `sort_order` و Inactiveها | UNIQUE روی همه محصولات (A) |
| R17 | تصویر هنگام Soft Delete | فایل باقی می‌ماند |
| R18 | `created_at` / `updated_at` | نه برای Product و Category؛ فقط `created_at` برای Session |
