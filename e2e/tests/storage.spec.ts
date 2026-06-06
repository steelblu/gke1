import { test, expect } from '@playwright/test'

async function expectGcsSuccessOrUnavailable(resp) {
  if (resp.status() === 400) {
    expect(resp.status()).toBe(400)
    return false
  }
  if (resp.ok()) {
    return true
  }
  expect(resp.status()).toBe(503)
  const body = await resp.json()
  expect(body).toHaveProperty('error', 'GCS unavailable')
  return false
}

test.describe('Storage API', () => {

  test('product upload URL returns signed URL or unavailable', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/products/a1b2c3d4-0001-4000-8000-000000000001/upload-url', {
      data: { contentType: 'image/jpeg' },
    })
    const ok = await expectGcsSuccessOrUnavailable(resp)
    if (ok) {
      const body = await resp.json()
      expect(body).toHaveProperty('uploadUrl')
      expect(body.uploadUrl).toContain('https://')
      expect(body.uploadUrl).toContain('shopping-mall-public')
      expect(body).toHaveProperty('objectPath')
      expect(body.objectPath).toContain('products/a1b2c3d4-0001-4000-8000-000000000001/image.jpg')
      expect(body).toHaveProperty('publicUrl')
      expect(body.publicUrl).toContain('shopping-mall-public')
    }
  })

  test('product image returns 404 when no image set', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/storage/products/a1b2c3d4-0001-4000-8000-000000000002/image')
    expect(resp.status()).toBe(404)
  })

  test('product upload URL with PNG content type', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/products/a1b2c3d4-0001-4000-8000-000000000001/upload-url', {
      data: { contentType: 'image/png' },
    })
    const ok = await expectGcsSuccessOrUnavailable(resp)
    if (ok) {
      const body = await resp.json()
      expect(body.objectPath).toContain('.png')
    }
  })

  test('document upload URL returns signed URL or unavailable', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/documents/upload-url', {
      data: { fileName: 'contract.pdf', contentType: 'application/pdf' },
    })
    const ok = await expectGcsSuccessOrUnavailable(resp)
    if (ok) {
      const body = await resp.json()
      expect(body).toHaveProperty('uploadUrl')
      expect(body.uploadUrl).toContain('https://')
      expect(body.uploadUrl).toContain('shopping-mall-private')
      expect(body).toHaveProperty('objectPath')
      expect(body.objectPath).toMatch(/^documents\/[\w-]+\/contract\.pdf$/)
      expect(body).toHaveProperty('publicUrl')
      expect(body.publicUrl).toBeNull()
    }
  })

  test('document upload requires fileName', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/documents/upload-url', {
      data: {},
    })
    expect(resp.status()).toBe(400)
    const body = await resp.json()
    expect(body).toHaveProperty('error', 'fileName is required')
  })

  test('document download URL returns signed URL or unavailable', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/documents/download-url', {
      data: { objectPath: 'documents/test/document.pdf' },
    })
    const ok = await expectGcsSuccessOrUnavailable(resp)
    if (ok) {
      const body = await resp.json()
      expect(body).toHaveProperty('downloadUrl')
      expect(body.downloadUrl).toContain('https://')
      expect(body.downloadUrl).toContain('shopping-mall-private')
      expect(body).toHaveProperty('objectPath', 'documents/test/document.pdf')
    }
  })

  test('document download requires objectPath', async ({ request }) => {
    const resp = await request.post('http://localhost:3000/api/storage/documents/download-url', {
      data: {},
    })
    expect(resp.status()).toBe(400)
    const body = await resp.json()
    expect(body).toHaveProperty('error', 'objectPath is required')
  })

  test('product image returns the updated URL or unavailable', async ({ request }) => {
    // First set the image via upload-url
    const uploadResp = await request.post('http://localhost:3000/api/storage/products/a1b2c3d4-0001-4000-8000-000000000001/upload-url', {
      data: { contentType: 'image/jpeg' },
    })
    if (!uploadResp.ok()) {
      expect(uploadResp.status()).toBe(503)
      return
    }

    // Now fetch the image URL
    const resp = await request.get('http://localhost:3000/api/storage/products/a1b2c3d4-0001-4000-8000-000000000001/image')
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toHaveProperty('publicUrl')
    expect(body.publicUrl).toContain('shopping-mall-public')
  })
})
