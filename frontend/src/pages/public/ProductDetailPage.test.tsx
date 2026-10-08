import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import ProductDetailPage from './ProductDetailPage'
import { server } from '../../test/server'
import { renderWithProviders } from '../../test/test-utils'

describe('ProductDetailPage', () => {
  it('renders the product details for a valid product', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: '/products/1' },
    )

    expect(await screen.findByRole('heading', { name: /هدفون بلوتوثی/i })).toBeInTheDocument()
    expect(screen.getByText(/لوازم الکترونیکی/i)).toBeInTheDocument()
    expect(screen.getByText(/موجود — ۱۲ عدد/i)).toBeInTheDocument()
  })

  it('shows the not found state when the product is missing', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/products/999', () => {
        return HttpResponse.json({ detail: 'Product not found' }, { status: 404 })
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: '/products/999' },
    )

    expect(await screen.findByText(/محصول پیدا نشد/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تلاش دوباره/i })).toBeInTheDocument()
  })
})
