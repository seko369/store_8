PUBLIC
GET    /api/v1/products
GET    /api/v1/products/{id}
GET    /api/v1/categories

ADMIN AUTH
POST   /api/v1/admin/login
POST   /api/v1/admin/logout
GET    /api/v1/admin/me

ADMIN PRODUCTS
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/{id}
PATCH  /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
PATCH  /api/v1/admin/products/{id}/restore

ADMIN CATEGORIES
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PATCH  /api/v1/admin/categories/{id}
DELETE /api/v1/admin/categories/{id}





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