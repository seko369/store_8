import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import HomePage from './HomePage'
import { productOne } from '../../test/mocks/handlers'
import { server } from '../../test/server'
import { renderWithProviders } from '../../test/test-utils'

describe('HomePage', () => {
  it('renders the loaded products list', async () => {
    renderWithProviders(<HomePage />)

    expect(await screen.findByRole('heading', { name: /هدفون بلوتوثی/i })).toBeInTheDocument()
    expect(screen.getByText(/محصولات فروشگاه/i)).toBeInTheDocument()
  })

  it('shows a loading state while the products query is pending', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/products', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))

        return HttpResponse.json({
          data: [productOne],
          page: 1,
          limit: 20,
          total: 1,
        })
      }),
    )

    renderWithProviders(<HomePage />)

    expect(screen.getByText(/در حال دریافت محصولات/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /هدفون بلوتوثی/i })).toBeInTheDocument()
  })

  it('shows the error state when the products request fails', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/products', () => {
        return HttpResponse.json({ detail: 'Server failed' }, { status: 500 })
      }),
    )

    renderWithProviders(<HomePage />)

    expect(await screen.findByRole('heading', { name: /دریافت محصولات ناموفق بود/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تلاش دوباره/i })).toBeInTheDocument()
  })
})
