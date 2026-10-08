import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import DashboardPage from './DashboardPage'
import { server } from '../../test/server'
import { renderWithProviders } from '../../test/test-utils'

describe('DashboardPage', () => {
  it('shows the dashboard loading state', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/admin/products', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))

        return HttpResponse.json({
          data: [],
          page: 1,
          limit: 20,
          total: 0,
        })
      }),
    )

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText(/در حال دریافت اطلاعات داشبورد/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /داشبورد/i })).toBeInTheDocument()
  })

  it('renders the dashboard with admin products', async () => {
    renderWithProviders(<DashboardPage />)

    expect(await screen.findByRole('heading', { name: /داشبورد/i })).toBeInTheDocument()
    expect(screen.getByText(/کل محصولات/i)).toBeInTheDocument()
    expect(screen.getByText(/هدفون بلوتوثی/i)).toBeInTheDocument()
    expect(screen.getByText(/اسپری خوشبو کننده/i)).toBeInTheDocument()
  })

  it('shows the error state when fetching the dashboard products fails', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/admin/products', () => {
        return HttpResponse.json({ detail: 'Failed to fetch dashboard data' }, { status: 500 })
      }),
    )

    renderWithProviders(<DashboardPage />)

    expect(await screen.findByRole('heading', { name: /خطا در دریافت اطلاعات/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تلاش دوباره/i })).toBeInTheDocument()
  })
})
