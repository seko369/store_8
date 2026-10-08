import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { router } from './router'
import { createTestQueryClient } from '../test/test-utils'
import { server } from '../test/server'

describe('router', () => {
  function renderAtRoute(initialEntry: string) {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: [initialEntry],
    })

    return render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={memoryRouter} />
      </QueryClientProvider>,
    )
  }

  it('keeps the home page accessible without admin auth', async () => {
    renderAtRoute('/')

    expect(await screen.findByRole('heading', { name: /محصولات فروشگاه/i })).toBeInTheDocument()
  })

  it('keeps the product detail page accessible without admin auth', async () => {
    renderAtRoute('/products/1')

    expect(await screen.findByRole('heading', { name: /هدفون بلوتوثی/i })).toBeInTheDocument()
  })

  it('keeps the admin login page accessible without admin auth', async () => {
    renderAtRoute('/admin/login')

    expect(await screen.findByRole('heading', { name: /خوش آمدید/i })).toBeInTheDocument()
  })

  it('redirects unauthenticated admin users to the login page', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/admin/me', () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
    )

    renderAtRoute('/admin/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /خوش آمدید/i })).toBeInTheDocument()
    })
  })

  it('allows authenticated admin users to access the dashboard', async () => {
    renderAtRoute('/admin/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /داشبورد/i })).toBeInTheDocument()
    })
  })
})
