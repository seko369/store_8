import { http, HttpResponse } from 'msw'

export const categoryOne = {
  id: 1,
  name: 'لوازم الکترونیکی',
}

export const categoryTwo = {
  id: 2,
  name: 'آرایشی و بهداشتی',
}

export const productOne = {
  id: 1,
  name: 'هدفون بلوتوثی',
  description: 'هدفون بلوتوثی با کیفیت صدا و ماندگاری بالا.',
  price: 2400000,
  image_url: '/uploads/products/headphone.jpg',
  category: categoryOne,
  stock: 12,
  sort_order: 1,
  is_active: true,
}

export const productTwo = {
  id: 2,
  name: 'اسپری خوشبو کننده',
  description: 'اسپری خوشبوکننده با رایحه‌ی دلنشین و ماندگار.',
  price: 780000,
  image_url: '/uploads/products/perfume.jpg',
  category: categoryTwo,
  stock: 0,
  sort_order: 2,
  is_active: true,
}

export const mockProductsResponse = {
  data: [productOne, productTwo],
  page: 1,
  limit: 20,
  total: 2,
}

export const mockAdminProductsResponse = {
  data: [productOne, productTwo],
  page: 1,
  limit: 20,
  total: 2,
}

export const handlers = [
  http.get('http://localhost:8000/api/v1/products', () => {
    return HttpResponse.json(mockProductsResponse)
  }),

  http.get('http://localhost:8000/api/v1/products/:id', ({ params }) => {
    const productId = Number(params.id)

    if (!Number.isInteger(productId) || productId <= 0 || productId === 999) {
      return HttpResponse.json(
        { detail: 'محصول پیدا نشد.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(productOne)
  }),

  http.get('http://localhost:8000/api/v1/categories', () => {
    return HttpResponse.json([categoryOne, categoryTwo])
  }),

  http.post('http://localhost:8000/api/v1/admin/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }

    if (body.email === 'admin@example.com' && body.password === 'admin123456') {
      return HttpResponse.json({ message: 'ورود با موفقیت انجام شد.' })
    }

    return HttpResponse.json(
      { detail: 'ایمیل یا رمز عبور صحیح نیست.' },
      { status: 401 },
    )
  }),

  http.get('http://localhost:8000/api/v1/admin/me', () => {
    return HttpResponse.json({ email: 'admin@example.com' })
  }),

  http.post('http://localhost:8000/api/v1/admin/logout', () => {
    return HttpResponse.json({ message: 'خروج با موفقیت انجام شد.' })
  }),

  http.get('http://localhost:8000/api/v1/admin/products', () => {
    return HttpResponse.json(mockAdminProductsResponse)
  }),
]
