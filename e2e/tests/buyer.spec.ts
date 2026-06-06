import { test, expect } from '@playwright/test'

test.describe('Buyer Frontend', () => {
  test('renders page title and header', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByRole('heading', { name: 'GKE Shop' })).toBeVisible()
    await expect(page.getByText('Buyer Frontend — react-buyer').first()).toBeVisible()
  })

  test('displays product list with 5 active products', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // wait for product cards to render (loading finishes)
    await expect(page.getByText('Wireless Bluetooth Headphones')).toBeVisible({ timeout: 15_000 })

    // all 5 active products should be shown
    await expect(page.getByText('Wireless Bluetooth Headphones')).toBeVisible()
    await expect(page.getByText('Ergonomic Office Chair')).toBeVisible()
    await expect(page.getByText('Mechanical Keyboard')).toBeVisible()
    await expect(page.getByText('Smartphone Stand')).toBeVisible()
    await expect(page.getByText('Portable SSD 1TB')).toBeVisible()
  })

  test('shows Korean-won formatted prices', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText('89,000원')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('159,000원')).toBeVisible()
    await expect(page.getByText('125,000원')).toBeVisible()
  })

  test('displays seller name and category for each product', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // first product card: Wireless Bluetooth Headphones — TechSupplier Inc. · Electronics
    await expect(page.getByText('TechSupplier Inc. · Electronics').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('KeyCraft Co. · Electronics').first()).toBeVisible()
    await expect(page.getByText('TechSupplier Inc. · Furniture')).toBeVisible()
  })

  test('shows hostname in footer', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText(/Host:/)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/localhost/)).toBeVisible()
  })

  test('excludes draft products from listing', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Draft Product should NOT be rendered (its status is "draft")
    await expect(page.getByText('Draft Product')).not.toBeVisible({ timeout: 15_000 })
  })

  test('shows upload/change image button on each product card', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText('Wireless Bluetooth Headphones')).toBeVisible({ timeout: 15_000 })

    // Products may show 'Upload Image' or 'Change Image' depending on whether thumbnailUrl is set
    const uploadButton = page.getByRole('button', { name: /Upload Image|Change Image/ })
    await expect(uploadButton.first()).toBeVisible()
    const count = await uploadButton.count()
    expect(count).toBe(5)
  })

  test('upload button is disabled during upload', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText('Wireless Bluetooth Headphones')).toBeVisible({ timeout: 15_000 })

    const button = page.getByRole('button', { name: /Upload Image|Change Image/ }).first()
    await expect(button).toBeEnabled()

    const fileChooserPromise = page.waitForEvent('filechooser')
    await button.click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    })

    await expect(page.getByRole('button', { name: 'Uploading...' }).first()).toBeVisible({ timeout: 5_000 })
  })

  test('shows success message after uploading image to GCS', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText('Wireless Bluetooth Headphones')).toBeVisible({ timeout: 15_000 })

    const button = page.getByRole('button', { name: /Upload Image|Change Image/ }).first()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await button.click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    })

    // GCS is connected — upload should succeed
    await expect(page.getByText('Image uploaded successfully')).toBeVisible({ timeout: 15_000 })
  })
})
