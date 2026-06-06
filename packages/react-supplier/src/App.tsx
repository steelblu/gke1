import { useEffect, useState } from 'react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  activeProducts: number
}

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/supplier/dashboard')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setStats(data)
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
        <p style={{ color: '#666' }}>Supplier Frontend — react-supplier</p>
      </header>

      <h2>Dashboard</h2>

      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <StatCard label="Total Products" value={stats.totalProducts} color="#1565c0" />
          <StatCard label="Active Products" value={stats.activeProducts} color="#2e7d32" />
          <StatCard label="Total Orders" value={stats.totalOrders} color="#e65100" />
          <StatCard label="Total Revenue" value={`${stats.totalRevenue.toLocaleString()}원`} color="#c62828" />
        </div>
      )}

      <section style={{ marginTop: 40 }}>
        <h2>Recent Orders</h2>
        <OrderList />
      </section>

      <footer style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #eee', color: '#999', fontSize: 13 }}>
        <p>Host: {window.location.hostname}</p>
        <p>E2E Test — Supplier Frontend → Spring API → Cloud SQL</p>
      </footer>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, textAlign: 'center' }}>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 'bold', margin: 0, color }}>{value}</p>
    </div>
  )
}

interface Order {
  id: string
  productName: string
  quantity: number
  totalAmount: number
  status: string
  createdAt: string
}

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supplier/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading orders...</p>
  if (orders.length === 0) return <p style={{ color: '#999' }}>No orders yet.</p>

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #333' }}>
          <th style={{ textAlign: 'left', padding: 8 }}>Order ID</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Product</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Qty</th>
          <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
          <th style={{ textAlign: 'center', padding: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 13 }}>{o.id.substring(0, 8)}</td>
            <td style={{ padding: 8 }}>{o.productName}</td>
            <td style={{ padding: 8, textAlign: 'right' }}>{o.quantity}</td>
            <td style={{ padding: 8, textAlign: 'right' }}>{o.totalAmount.toLocaleString()}원</td>
            <td style={{ padding: 8, textAlign: 'center' }}>
              <span style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                fontSize: 12, fontWeight: 'bold',
                background: o.status === 'completed' ? '#e8f5e9' : o.status === 'pending' ? '#fff3e0' : '#fce4ec',
                color: o.status === 'completed' ? '#2e7d32' : o.status === 'pending' ? '#e65100' : '#c62828'
              }}>
                {o.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default App
