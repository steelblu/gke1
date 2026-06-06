import { test, expect } from '@playwright/test'

test.describe('Supplier Frontend', () => {
  test('renders page title and header', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await expect(page.getByRole('heading', { name: 'GKE Shop' })).toBeVisible()
    await expect(page.getByText('Supplier Frontend — react-supplier').first()).toBeVisible()
  })

  test('displays dashboard stats cards', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await expect(page.getByText('Total Products')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Active Products')).toBeVisible()
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Total Revenue')).toBeVisible()
  })

  test('shows correct stat values from seed data', async ({ page }) => {
    await page.goto('http://localhost:3001')
    // seed: 6 products (5 active + 1 draft), 3 orders, total = 178000+125000+159000 = 462000
    await expect(page.getByText('Total Products')).toBeVisible({ timeout: 15_000 })
    // each StatCard has a bold <p> sibling for the value
    const totalProducts = page.getByText('6').first()
    await expect(totalProducts).toBeVisible()
    const activeProducts = page.getByText('5').first()
    await expect(activeProducts).toBeVisible()
    const totalOrders = page.getByText('3').first()
    await expect(totalOrders).toBeVisible()
  })

  test('renders orders table with columns', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await expect(page.getByText('Recent Orders')).toBeVisible()
    await expect(page.getByRole('table').getByText('Order ID')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('table').getByText('Product')).toBeVisible()
    await expect(page.getByRole('table').getByText('Qty')).toBeVisible()
    await expect(page.getByRole('table').getByText('Amount')).toBeVisible()
    await expect(page.getByRole('table').getByText('Status')).toBeVisible()
  })

  test('displays seeded orders with correct status badges', async ({ page }) => {
    await page.goto('http://localhost:3001')
    // order 1: Wireless Bluetooth Headphones, completed
    await expect(page.getByText('completed').first()).toBeVisible({ timeout: 15_000 })
    // order 2: Mechanical Keyboard, shipped
    await expect(page.getByText('shipped').first()).toBeVisible()
    // order 3: Portable SSD 1TB, pending
    await expect(page.getByText('pending').first()).toBeVisible()
  })

  test('shows hostname in footer', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await expect(page.getByText(/Host:/)).toBeVisible({ timeout: 15_000 })
  })
})
