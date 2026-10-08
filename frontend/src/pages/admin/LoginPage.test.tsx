import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { router } from '../../routes/router'
import { createTestQueryClient } from '../../test/test-utils'
import { server } from '../../test/server'

describe('LoginPage', () => {
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

  it('renders the login form', () => {
    renderAtRoute('/admin/login')

    expect(screen.getByRole('heading', { name: /خوش آمدید/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/ایمیل/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/رمز عبور/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ورود به پنل/i })).toBeInTheDocument()
  })

  it('logs in successfully and navigates to the dashboard', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('http://localhost:8000/api/v1/admin/login', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))

        return HttpResponse.json({ message: 'ورود با موفقیت انجام شد.' })
      }),
    )

    renderAtRoute('/admin/login')

    await user.type(screen.getByLabelText(/ایمیل/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/رمز عبور/i), 'admin123456')
    await user.click(screen.getByRole('button', { name: /ورود به پنل/i }))

    expect(screen.getByRole('button', { name: /در حال ورود/i })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /داشبورد/i })).toBeInTheDocument()
    })
  })

  it('shows the auth error for invalid credentials without redirecting', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('http://localhost:8000/api/v1/admin/login', () => {
        return HttpResponse.json(
          { detail: 'ایمیل یا رمز عبور صحیح نیست.' },
          { status: 401 },
        )
      }),
    )

    renderAtRoute('/admin/login')

    await user.type(screen.getByLabelText(/ایمیل/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/رمز عبور/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /ورود به پنل/i }))

    expect(await screen.findByText(/ایمیل یا رمز عبور صحیح نیست./i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /داشبورد/i })).not.toBeInTheDocument()
  })
})
