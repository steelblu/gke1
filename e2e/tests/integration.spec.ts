import { test, expect } from '@playwright/test'

test.describe('API Integration', () => {
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
    const resp = await request.get('http://localhost:3000/api/buyer/products')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(Array.isArray(body)).toBeTruthy()
    expect(body.length).toBe(5)
  })

  test('Spring buyer products supports category filter', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/buyer/products?category=Furniture')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body.length).toBe(1)
    expect(body[0].name).toBe('Ergonomic Office Chair')
  })

  test('Recommendation endpoint returns recommendations', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/buyer/recommend?userId=e2e-test')
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
    const resp = await request.get('http://localhost:3001/api/supplier/dashboard')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toHaveProperty('totalProducts')
    expect(body).toHaveProperty('activeProducts')
    expect(body).toHaveProperty('totalOrders')
    expect(body).toHaveProperty('totalRevenue')
  })

  test('Supplier orders returns order list', async ({ request }) => {
    const resp = await request.get('http://localhost:3001/api/supplier/orders')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(Array.isArray(body)).toBeTruthy()
    expect(body.length).toBe(3)
  })

  test('CORS headers are NOT set (same-origin proxy)', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/health')
    // Same-origin via Vite proxy — no CORS headers should leak
    const acao = resp.headers()['access-control-allow-origin']
    expect(acao).toBeUndefined()
  })
})
