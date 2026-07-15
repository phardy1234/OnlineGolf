import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { listProductsByCategory } from '../api/products'
import { CATEGORIES, type Category, type Product } from '../types'

export function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const meta = CATEGORIES.find((c) => c.value === category)

  useEffect(() => {
    if (!category) return
    setLoading(true)
    listProductsByCategory(category as Category)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [category])

  if (!meta) {
    return <p className="empty-state">Unknown category.</p>
  }

  return (
    <div className="category-page">
      <h1>{meta.label}</h1>
      {loading ? <LoadingSpinner /> : <ProductGrid products={products} />}
    </div>
  )
}
