import { useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function OrdersModal() {
  const { orders, ordersLoading, error, closeOrders, fetchOrders } = useCart()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2e7d32'
      case 'shipped': return '#1565c0'
      case 'confirmed': return '#f57f17'
      case 'pending': return '#e65100'
      case 'canceled': return '#c62828'
      default: return '#666'
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) closeOrders() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: 640, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: 20 }}>My Orders</h2>
          <button
            onClick={closeOrders}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', padding: '4px 8px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {ordersLoading && <p style={{ color: '#666' }}>Loading orders...</p>}
        {error && <p style={{ color: '#c62828', fontSize: 13 }}>{error}</p>}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!ordersLoading && orders.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: 32 }}>No orders yet.</p>
          )}
          {orders.map(order => (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 14, color: '#333' }}>{order.productName}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                  {order.quantity} × {(order.unitPrice).toLocaleString()}원
                  {' — '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 14, color: '#e53935' }}>
                  {order.totalAmount.toLocaleString()}원
                </p>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11,
                  background: statusColor(order.status) + '18',
                  color: statusColor(order.status),
                  fontWeight: 'bold',
                }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
