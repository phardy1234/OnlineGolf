import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CartItemRow } from '../components/cart/CartItemRow'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../firebase/orders'

export function CartPage() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const [placing, setPlacing] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  async function handlePlaceOrder() {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    setPlacing(true)
    try {
      const orderId = await placeOrder(user.uid, items, total)
      setPlacedOrderId(orderId)
      clear()
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrderId) {
    return (
      <div className="cart-page">
        <h1>Order Placed</h1>
        <p className="form-success">
          Thanks — your demo order <strong>{placedOrderId}</strong> has been recorded. This is a demo
          store, so no payment was actually processed.
        </p>
        <Link to="/profile">View your order history</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <p className="empty-state">
          Your cart is empty. <Link to="/">Browse products</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-list">
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </div>
      <div className="cart-summary">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
      <button type="button" onClick={handlePlaceOrder} disabled={placing}>
        {placing ? 'Placing order…' : 'Place Order (Demo)'}
      </button>
    </div>
  )
}
