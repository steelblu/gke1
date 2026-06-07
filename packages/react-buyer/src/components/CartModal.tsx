import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

interface Props {
  afterCheckout?: () => void
}

export default function CartModal({ afterCheckout }: Props) {
  const { items, loading, error, closeCart, updateQuantity, removeItem, checkout, fetchCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      await checkout()
      afterCheckout?.()
      closeCart()
    } catch {
      // error handled by context
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) closeCart() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: 480, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: 20 }}>Shopping Cart</h2>
          <button
            onClick={closeCart}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', padding: '4px 8px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {loading && <p style={{ color: '#666' }}>Loading cart...</p>}
        {error && <p style={{ color: '#c62828', fontSize: 13 }}>{error}</p>}

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          {!loading && items.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: 32 }}>Your cart is empty.</p>
          )}
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{
                width: 64, height: 64, background: '#f0f0f0', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaa', fontSize: 12, flexShrink: 0, overflow: 'hidden',
              }}>
                {item.thumbnailUrl ? (
                  <img src={`https://storage.googleapis.com/shopping-mall-public/${item.thumbnailUrl}`} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : 'No Img'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 14, color: '#333' }}>{item.productName}</p>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#e53935', fontWeight: 'bold' }}>
                  {(item.unitPrice * item.quantity).toLocaleString()}원
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4 }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}
                    >
                      −
                    </button>
                    <span style={{ padding: '4px 8px', fontSize: 14, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ borderTop: '2px solid #333', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 'bold' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#e53935' }}>{totalAmount.toLocaleString()}원</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                width: '100%', padding: '12px 0', background: '#333', color: '#fff',
                border: 'none', borderRadius: 4, fontSize: 16, cursor: checkingOut ? 'not-allowed' : 'pointer',
                opacity: checkingOut ? 0.7 : 1,
              }}
            >
              {checkingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
