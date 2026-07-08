import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { buildImageUrl } from '../../utils/image'
import type { Product } from '../../types'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="product-card">
      <img
        src={buildImageUrl(product.imageSeed, 400, 300)}
        alt={product.name}
        loading="lazy"
        className="product-card__image"
      />
      <div className="product-card__body">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button type="button" onClick={handleAdd} disabled={product.stock <= 0}>
            {product.stock <= 0 ? 'Out of stock' : added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
