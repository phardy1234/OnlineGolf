import { useEffect, useState, type FormEvent } from 'react'
import { FormField } from '../components/common/FormField'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { listOrdersForUser } from '../firebase/orders'
import { updateOwnProfile } from '../firebase/users'
import type { Order } from '../types'

export function CustomerProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [line1, setLine1] = useState(profile?.address?.line1 ?? '')
  const [city, setCity] = useState(profile?.address?.city ?? '')
  const [postcode, setPostcode] = useState(profile?.address?.postcode ?? '')
  const [country, setCountry] = useState(profile?.address?.country ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    listOrdersForUser(user.uid)
      .then(setOrders)
      .finally(() => setOrdersLoading(false))
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      await updateOwnProfile(user.uid, {
        displayName,
        phone,
        address: { line1, city, postcode, country },
      })
      await refreshProfile()
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <FormField
          label="Name"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <FormField label="Phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <FormField
          label="Address Line 1"
          id="line1"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
        />
        <FormField label="City" id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        <FormField
          label="Postcode"
          id="postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <FormField
          label="Country"
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        {saved && <p className="form-success">Profile updated.</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <section className="order-history">
        <h2>Order History</h2>
        {ordersLoading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id} className="order-list__item">
                <span>{order.id}</span>
                <span>{order.items.length} item(s)</span>
                <span>${order.total.toFixed(2)}</span>
                <span className={`order-status order-status--${order.status}`}>{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
