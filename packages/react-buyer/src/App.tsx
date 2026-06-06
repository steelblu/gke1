import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  thumbnailUrl: string
  sellerName: string
  category: string
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/buyer/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <header style={{ borderBottom: '2px solid #333', marginBottom: 24 }}>
        <h1>GKE Shop</h1>
        <p style={{ color: '#666' }}>Buyer Frontend — react-buyer</p>
      </header>

      <h2>Products</h2>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <div style={{
              width: '100%', height: 160,
              background: '#f0f0f0', borderRadius: 4, marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#aaa', fontSize: 14
            }}>
              {p.thumbnailUrl || 'No Image'}
            </div>
            <h3 style={{ margin: '0 0 4px' }}>{p.name}</h3>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px' }}>
              {p.sellerName} · {p.category}
            </p>
            <p style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e53935' }}>
              {p.price.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p style={{ color: '#999' }}>No products available.</p>
      )}

      <footer style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #eee', color: '#999', fontSize: 13 }}>
        <p>Host: {window.location.hostname}</p>
        <p>E2E Test — Buyer Frontend → Spring API → Cloud SQL</p>
      </footer>
    </div>
  )
}

export default App
