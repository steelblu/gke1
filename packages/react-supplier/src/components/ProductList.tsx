import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import ProductForm from './ProductForm'

interface ProductResponse {
  id: number
  name: string
  description: string
  price: number
  stock: number
  status: 'draft' | 'active' | 'out_of_stock' | 'discontinued'
  category: string
  supplierId: number
  supplierName: string
  thumbnailUrl: string
  createdAt: string
  updatedAt: string
}

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  draft: { background: '#fff3e0', color: '#e65100' },
  active: { background: '#e8f5e9', color: '#2e7d32' },
  out_of_stock: { background: '#fce4ec', color: '#c62828' },
  discontinued: { background: '#f5f5f5', color: '#999' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { background: '#f5f5f5', color: '#999' }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
        background: style.background,
        color: style.color,
      }}
    >
      {status === 'out_of_stock' ? 'out of stock' : status}
    </span>
  )
}

export default function ProductList() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchProducts = () => {
    setLoading(true)
    setError(null)
    apiFetch<ProductResponse[]>('/api/supplier/products')
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    setDeleteError(null)
    try {
      await apiFetch(`/api/supplier/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setDeleteError(message)
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product: ProductResponse) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleFormSaved = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#333' }}>Products</h3>
        <button
          onClick={handleNewProduct}
          style={{
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 16px',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + New Product
        </button>
      </div>

      {deleteError && (
        <p style={{ color: '#c62828', fontSize: 13, margin: '0 0 8px' }}>Error: {deleteError}</p>
      )}

      {loading && <p style={{ color: '#666', fontSize: 13 }}>Loading products...</p>}

      {error && <p style={{ color: '#c62828', fontSize: 13 }}>Failed to load products: {error}</p>}

      {!loading && !error && products.length === 0 && (
        <p style={{ color: '#999', fontSize: 13 }}>No products yet. Create one!</p>
      )}

      {!loading && products.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Price</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Stock</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 13 }}>
                  {String(p.id).padStart(4, '0')}
                </td>
                <td style={{ padding: 8, fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{p.price.toLocaleString()}원</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{p.stock.toLocaleString()}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <StatusBadge status={p.status} />
                </td>
                <td style={{ padding: 8 }}>{p.category || '-'}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(p)}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '3px 10px',
                      fontSize: 12,
                      color: '#666',
                      cursor: 'pointer',
                      marginRight: 6,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '3px 10px',
                      fontSize: 12,
                      color: '#c62828',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </section>
  )
}
