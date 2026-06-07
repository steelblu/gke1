import { test, expect } from '@playwright/test'

test.describe('API Integration', () => {
  let supplierToken: string
  let buyerToken: string

  test.beforeAll(async ({ request }) => {
    const supResp = await request.post('http://localhost:3001/auth/login', {
      data: { username: 'techsupplier', password: 'password123' }
    })
    const supBody = await supResp.json()
    supplierToken = supBody.token

    const buyResp = await request.post('http://localhost:3000/auth/login', {
      data: { username: 'buyer1', password: 'password123' }
    })
    const buyBody = await buyResp.json()
    buyerToken = buyBody.token
  })

  test('Spring Health endpoint returns UP', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/health')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toMatchObject({ status: 'UP', service: 'spring-app' })
    expect(typeof body.timestamp).toBe('number')
  })

  test('FastAPI Health proxy returns UP', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/ai/health')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toMatchObject({ status: 'UP', service: 'fastapi-ai' })
  })

  test('Spring buyer products endpoint returns 5 products', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/buyer/products', {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(Array.isArray(body)).toBeTruthy()
    expect(body.length).toBe(5)
  })

  test('Spring buyer products supports category filter', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/buyer/products?category=Furniture', {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body.length).toBe(1)
    expect(body[0].name).toBe('Ergonomic Office Chair')
  })

  test('Recommendation endpoint returns recommendations', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/buyer/recommend?userId=e2e-test', {
      headers: { Authorization: `Bearer ${buyerToken}` }
    })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toHaveProperty('user_id', 'e2e-test')
    expect(body).toHaveProperty('recommendations')
    expect(Array.isArray(body.recommendations)).toBeTruthy()
    expect(body.recommendations.length).toBeGreaterThanOrEqual(1)
    expect(body.recommendations[0]).toHaveProperty('name')
    expect(body.recommendations[0]).toHaveProperty('score')
  })

  test('Supplier dashboard returns stats', async ({ request }) => {
    const resp = await request.get('http://localhost:3001/api/supplier/dashboard', {
      headers: { 'Authorization': `Bearer ${supplierToken}` }
    })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toHaveProperty('totalProducts')
    expect(body).toHaveProperty('activeProducts')
    expect(body).toHaveProperty('totalOrders')
    expect(body).toHaveProperty('totalRevenue')
  })

  test('Supplier orders returns order list', async ({ request }) => {
    const resp = await request.get('http://localhost:3001/api/supplier/orders', {
      headers: { 'Authorization': `Bearer ${supplierToken}` }
    })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(Array.isArray(body)).toBeTruthy()
    expect(body.length).toBeGreaterThanOrEqual(3)
  })

  test.describe('Supplier Product CRUD', () => {
    let createdId: string

    test('list supplier products', async ({ request }) => {
      const resp = await request.get('http://localhost:3001/api/supplier/products', {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
      })
      expect(resp.ok()).toBeTruthy()
      const body = await resp.json()
      expect(Array.isArray(body)).toBeTruthy()
      expect(body.length).toBeGreaterThanOrEqual(4)
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('name')
      expect(body[0]).toHaveProperty('price')
      expect(body[0]).toHaveProperty('stock')
      expect(body[0]).toHaveProperty('status')
    })

    test('create a new product', async ({ request }) => {
      const resp = await request.post('http://localhost:3001/api/supplier/products', {
        headers: { 'Authorization': `Bearer ${supplierToken}` },
        data: { name: 'E2E Test Product', description: 'Created by Playwright', price: 19900, stock: 50, status: 'active', category: 'Test' }
      })
      expect(resp.ok()).toBeTruthy()
      expect(resp.status()).toBe(201)
      const body = await resp.json()
      expect(body.name).toBe('E2E Test Product')
      expect(body.price).toBe(19900)
      expect(body.stock).toBe(50)
      expect(body.status).toBe('active')
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('supplierName')
      expect(body.supplierName).toBeTruthy()
      createdId = body.id
    })

    test('get created product by id', async ({ request }) => {
      // createdId is set in previous test (tests run in order within describe)
      const listResp = await request.get('http://localhost:3001/api/supplier/products', {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
      })
      const list = await listResp.json()
      createdId = list.find((p: any) => p.name === 'E2E Test Product')?.id
      expect(createdId).toBeTruthy()

      const resp = await request.get(`http://localhost:3001/api/supplier/products/${createdId}`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
      })
      expect(resp.ok()).toBeTruthy()
      const body = await resp.json()
      expect(body.name).toBe('E2E Test Product')
      expect(body.price).toBe(19900)
    })

    test('update product price', async ({ request }) => {
      const resp = await request.put(`http://localhost:3001/api/supplier/products/${createdId}`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` },
        data: { price: 25000 }
      })
      expect(resp.ok()).toBeTruthy()
      const body = await resp.json()
      expect(body.price).toBe(25000)
    })

    test('delete product', async ({ request }) => {
      const resp = await request.delete(`http://localhost:3001/api/supplier/products/${createdId}`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
      })
      expect(resp.status()).toBe(204)

      const getResp = await request.get(`http://localhost:3001/api/supplier/products/${createdId}`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
      })
      expect(getResp.status()).toBe(500)
    })
  })

  test('CORS headers are NOT set (same-origin proxy)', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/health')
    // Same-origin via Vite proxy — no CORS headers should leak
    const acao = resp.headers()['access-control-allow-origin']
    expect(acao).toBeUndefined()
  })

  test.describe('Buyer Cart & Orders', () => {
    // Re-seed cart items if consumed by a prior checkout test run
    test.beforeAll(async ({ request }) => {
      const listResp = await request.get('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      const items = await listResp.json()
      if (items.length === 0) {
        await request.post('http://localhost:3000/api/buyer/cart', {
          headers: { 'Authorization': `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
          data: { productId: 'a1b2c3d4-0001-4000-8000-000000000001', quantity: 2 }
        })
        await request.post('http://localhost:3000/api/buyer/cart', {
          headers: { 'Authorization': `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
          data: { productId: 'a1b2c3d4-0001-4000-8000-000000000004', quantity: 1 }
        })
      }
    })

    test('get buyer cart returns 2 seeded items', async ({ request }) => {
      const resp = await request.get('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      expect(resp.ok()).toBeTruthy()
      const body = await resp.json()
      expect(Array.isArray(body)).toBeTruthy()
      expect(body.length).toBe(2)
      expect(body[0]).toHaveProperty('productName')
      expect(body[0]).toHaveProperty('unitPrice')
      expect(body[0]).toHaveProperty('quantity')
    })

    test('add item to cart', async ({ request }) => {
      // Add Portable SSD 1TB to cart (not already seeded)
      const resp = await request.post('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
        data: { productId: 'a1b2c3d4-0001-4000-8000-000000000005', quantity: 1 }
      })
      expect(resp.ok()).toBeTruthy()
      expect(resp.status()).toBe(201)
      const body = await resp.json()
      expect(body.productName).toBe('Portable SSD 1TB')
      expect(body.quantity).toBe(1)

      // Cleanup: remove the added item
      await request.delete(`http://localhost:3000/api/buyer/cart/${body.id}`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
    })

    test('update cart item quantity', async ({ request }) => {
      // Get first seeded cart item
      const listResp = await request.get('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      const items = await listResp.json()
      const firstItem = items[0]
      expect(firstItem).toBeTruthy()

      // Update quantity to 5
      const updateResp = await request.put(`http://localhost:3000/api/buyer/cart/${firstItem.id}`, {
        headers: { 'Authorization': `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
        data: { quantity: 5 }
      })
      expect(updateResp.ok()).toBeTruthy()
      const updated = await updateResp.json()
      expect(updated.quantity).toBe(5)

      // Restore original quantity
      await request.put(`http://localhost:3000/api/buyer/cart/${firstItem.id}`, {
        headers: { 'Authorization': `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
        data: { quantity: firstItem.quantity }
      })
    })

    test('checkout creates orders and clears cart', async ({ request }) => {
      // First get current cart items and remember count
      const cartBeforeResp = await request.get('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      const cartBefore = await cartBeforeResp.json()
      const cartCount = cartBefore.length

      // Checkout
      const checkoutResp = await request.post('http://localhost:3000/api/buyer/orders', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      expect(checkoutResp.ok()).toBeTruthy()
      expect(checkoutResp.status()).toBe(201)
      const orders = await checkoutResp.json()
      expect(Array.isArray(orders)).toBeTruthy()
      expect(orders.length).toBe(cartCount)
      if (orders.length > 0) {
        expect(orders[0]).toHaveProperty('productName')
        expect(orders[0]).toHaveProperty('totalAmount')
        expect(orders[0]).toHaveProperty('status')
        expect(orders[0].status).toBe('pending')
      }

      // Cart should now be empty
      const cartAfterResp = await request.get('http://localhost:3000/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      const cartAfter = await cartAfterResp.json()
      expect(cartAfter.length).toBe(0)
    })

    test('get buyer orders returns orders', async ({ request }) => {
      const resp = await request.get('http://localhost:3000/api/buyer/orders', {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      })
      expect(resp.ok()).toBeTruthy()
      const body = await resp.json()
      expect(Array.isArray(body)).toBeTruthy()
      // Should have at least the orders created by checkout test
      expect(body.length).toBeGreaterThanOrEqual(1)
      expect(body[0]).toHaveProperty('productName')
      expect(body[0]).toHaveProperty('totalAmount')
      expect(body[0]).toHaveProperty('status')
      expect(body[0]).toHaveProperty('createdAt')
    })
  })
})
