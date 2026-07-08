import { useEffect, useState, type FormEvent } from 'react'
import { FormField } from '../components/common/FormField'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type NewProduct,
} from '../firebase/products'
import { CATEGORIES, type Category, type Product } from '../types'

const emptyForm: NewProduct = {
  name: '',
  category: 'drivers',
  brand: '',
  price: 0,
  description: '',
  imageSeed: '',
  stock: 0,
}

export function AdminProfilePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NewProduct>(emptyForm)
  const [saving, setSaving] = useState(false)

  function refresh() {
    setLoading(true)
    return listProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      description: product.description,
      imageSeed: product.imageSeed,
      stock: product.stock,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateProduct(editingId, form)
      } else {
        await createProduct(form)
      }
      cancelEdit()
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
    await refresh()
  }

  return (
    <div className="admin-page">
      <h1>Admin — Manage Products</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
        <FormField
          label="Name"
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Brand"
          id="brand"
          required
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />
        <FormField
          label="Price"
          id="price"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <FormField
          label="Stock"
          id="stock"
          type="number"
          min={0}
          required
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <FormField
          label="Image Seed"
          id="imageSeed"
          required
          placeholder="e.g. driver-titanium-1"
          value={form.imageSeed}
          onChange={(e) => setForm({ ...form, imageSeed: e.target.value })}
        />
        <FormField
          label="Description"
          id="description"
          as="textarea"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="admin-form__actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Catalog</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category}</td>
                <td>{p.brand}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td className="admin-table__actions">
                  <button type="button" className="link-button" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button type="button" className="link-button" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
