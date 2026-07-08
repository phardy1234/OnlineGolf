import { useCart } from '../../context/CartContext'
import { buildImageUrl } from '../../utils/image'
import type { OrderItem } from '../../types'

export function CartItemRow({ item }: { item: OrderItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="cart-item">
      <img src={buildImageUrl(item.imageSeed, 100, 75)} alt={item.name} className="cart-item__image" />
      <div className="cart-item__details">
        <p className="cart-item__name">{item.name}</p>
        <p className="cart-item__price">${item.price.toFixed(2)} each</p>
      </div>
      <div className="cart-item__quantity">
        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
          −
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
          +
        </button>
      </div>
      <p className="cart-item__subtotal">${(item.price * item.quantity).toFixed(2)}</p>
      <button type="button" className="link-button" onClick={() => removeItem(item.productId)}>
        Remove
      </button>
    </div>
  )
}
