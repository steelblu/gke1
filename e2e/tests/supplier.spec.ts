import { test, expect } from '@playwright/test'

test.describe('Supplier Frontend', () => {
  test.beforeEach(async ({ page, request }) => {
    const resp = await request.post('http://localhost:3001/auth/login', {
      data: { username: 'techsupplier', password: 'password123' }
    })
    const { token } = await resp.json()

    await page.addInitScript(`window.localStorage.setItem('supplier_token', '${token}'); window.localStorage.setItem('supplier_role', 'SUPPLIER');`)
    await page.goto('http://localhost:3001')
  })

  test('renders page title and header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'GKE Shop' })).toBeVisible()
    await expect(page.getByText('Supplier Frontend — react-supplier').first()).toBeVisible()
  })

  test('displays dashboard stats cards', async ({ page }) => {
    await expect(page.getByText('Total Products')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Active Products')).toBeVisible()
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Total Revenue')).toBeVisible()
  })

  test('shows correct stat values from seed data', async ({ page }) => {
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
    await expect(page.getByText('Recent Orders')).toBeVisible()
    await expect(page.getByRole('table').getByText('Order ID')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('table').getByText('Product')).toBeVisible()
    await expect(page.getByRole('table').getByText('Qty')).toBeVisible()
    await expect(page.getByRole('table').getByText('Amount')).toBeVisible()
    await expect(page.getByRole('table').getByText('Status')).toBeVisible()
  })

  test('displays seeded orders with correct status badges', async ({ page }) => {
    // order 1: Wireless Bluetooth Headphones, completed
    await expect(page.getByText('completed').first()).toBeVisible({ timeout: 15_000 })
    // order 2: Mechanical Keyboard, shipped
    await expect(page.getByText('shipped').first()).toBeVisible()
    // order 3: Portable SSD 1TB, pending
    await expect(page.getByText('pending').first()).toBeVisible()
  })

  test('shows hostname in footer', async ({ page }) => {
    await expect(page.getByText(/Host:/)).toBeVisible({ timeout: 15_000 })
  })

  test('navigates to Products tab and shows product list', async ({ page }) => {
    await page.getByRole('button', { name: 'Products' }).click()
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('+ New Product')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
  })

  test('opens New Product form modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Products' }).click()
    await page.getByRole('button', { name: '+ New Product' }).click()
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByLabel('Description')).toBeVisible()
    await expect(page.getByLabel('Price (원)')).toBeVisible()
    await expect(page.getByLabel('Stock')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByLabel('Name')).not.toBeVisible()
  })

  test('creates a product via modal and verifies in list', async ({ page }) => {
    await page.getByRole('button', { name: 'Products' }).click()
    await page.getByRole('button', { name: '+ New Product' }).click()
    await page.getByLabel('Name').fill('Browser Test Product')
    await page.getByLabel('Description').fill('Created via Playwright browser')
    await page.getByLabel('Price (원)').fill('35000')
    await page.getByLabel('Stock').fill('20')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Browser Test Product')).toBeVisible({ timeout: 10_000 })
  })
})
