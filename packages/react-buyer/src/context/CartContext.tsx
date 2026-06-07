import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { apiFetch } from '../api'

export interface CartItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  thumbnailUrl: string | null
  quantity: number
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: string
  createdAt: string
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
  showCart: boolean
  showOrders: boolean
  orders: OrderItem[]
  ordersLoading: boolean
  cartCount: number
  openCart: () => void
  closeCart: () => void
  openOrders: () => void
  closeOrders: () => void
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  checkout: () => Promise<OrderItem[]>
  fetchOrders: () => Promise<void>
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const openCart = useCallback(() => setShowCart(true), [])
  const closeCart = useCallback(() => setShowCart(false), [])
  const openOrders = useCallback(() => setShowOrders(true), [])
  const closeOrders = useCallback(() => setShowOrders(false), [])

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<CartItem[]>('/api/buyer/cart')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    setError(null)
    try {
      await apiFetch('/api/buyer/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      })
      await fetchCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart')
    }
  }, [fetchCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setError(null)
    try {
      if (quantity <= 0) {
        await apiFetch(`/api/buyer/cart/${itemId}`, { method: 'DELETE' })
      } else {
        await apiFetch(`/api/buyer/cart/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        })
      }
      await fetchCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    }
  }, [fetchCart])

  const removeItem = useCallback(async (itemId: string) => {
    setError(null)
    try {
      await apiFetch(`/api/buyer/cart/${itemId}`, { method: 'DELETE' })
      await fetchCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    }
  }, [fetchCart])

  const checkout = useCallback(async (): Promise<OrderItem[]> => {
    setError(null)
    try {
      const result = await apiFetch<OrderItem[]>('/api/buyer/orders', { method: 'POST' })
      setItems([])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      throw err
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const data = await apiFetch<OrderItem[]>('/api/buyer/orders')
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      items, loading, error, showCart, showOrders, orders, ordersLoading, cartCount,
      openCart, closeCart, openOrders, closeOrders,
      fetchCart, addToCart, updateQuantity, removeItem, checkout, fetchOrders,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
