import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'

import ProductCard from './ProductCard'
import { productOne } from '../test/mocks/handlers'
import { renderWithProviders } from '../test/test-utils'

describe('ProductCard', () => {
  it('renders the product details and link', () => {
    renderWithProviders(<ProductCard product={productOne} />)

    expect(screen.getByText(productOne.name)).toBeInTheDocument()
    expect(screen.getByText(productOne.category.name)).toBeInTheDocument()
    expect(screen.getByText(/موجود/i)).toBeInTheDocument()
    expect(screen.getByAltText(productOne.name)).toHaveAttribute(
      'src',
      'http://localhost:8000/uploads/products/headphone.jpg',
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/1')
  })
})
