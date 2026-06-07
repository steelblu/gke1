import { useEffect, useRef, useState } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'

interface Product {
  id: string
  name: string
  price: number
  thumbnailUrl: string
  sellerName: string
  category: string
}

interface UploadState {
  uploadingId: string | null
  message: string | null
  messageType: 'success' | 'error' | null
}

function App() {
  const auth = useAuth()

  if (!auth.token) {
    return <LoginPage variant="page" />
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upload, setUpload] = useState<UploadState>({ uploadingId: null, message: null, messageType: null })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingProductRef = useRef<string | null>(null)

  const authHeaders: Record<string, string> = auth.token
    ? { 'Authorization': `Bearer ${auth.token}` }
    : {}

  const fetchProducts = () => {
    setLoading(true)
    fetch('/api/buyer/products', { headers: { ...authHeaders } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => { fetchProducts() }, [auth.token])

  const triggerUpload = (productId: string) => {
    pendingProductRef.current = productId
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const productId = pendingProductRef.current
    if (!file || !productId) return

    setUpload({ uploadingId: productId, message: 'Uploading...', messageType: null })

    try {
      const contentType = file.type || 'image/jpeg'
      const urlResp = await fetch(`/api/storage/products/${productId}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ contentType }),
      })

      if (!urlResp.ok) {
        const errBody = await urlResp.json()
        throw new Error(errBody.error || `HTTP ${urlResp.status}`)
      }

      const { uploadUrl } = await urlResp.json()

      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      })

      if (!uploadResp.ok) {
        throw new Error(`GCS upload failed: HTTP ${uploadResp.status}`)
      }

      setUpload({ uploadingId: null, message: 'Image uploaded successfully', messageType: 'success' })
      setTimeout(() => setUpload({ uploadingId: null, message: null, messageType: null }), 3000)
      fetchProducts()
    } catch (err) {
      setUpload({ uploadingId: null, message: err instanceof Error ? err.message : 'Upload failed', messageType: 'error' })
      setTimeout(() => setUpload({ uploadingId: null, message: null, messageType: null }), 5000)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <header style={{ borderBottom: '2px solid #333', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>GKE Shop</h1>
          <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Buyer Frontend — react-buyer</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ color: '#666', fontSize: 13 }}>{auth.username}</span>
          <button
            onClick={auth.logout}
            style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: '#666', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      <h2>Products</h2>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {upload.message && (
        <p style={{
          padding: '8px 16px', borderRadius: 4, marginBottom: 16,
          background: upload.messageType === 'success' ? '#e8f5e9' : '#ffebee',
          color: upload.messageType === 'success' ? '#2e7d32' : '#c62828',
        }}>
          {upload.message}
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {products.map(p => {
          const isUploading = upload.uploadingId === p.id
          return (
            <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
              <div style={{
                width: '100%', height: 160,
                background: '#f0f0f0', borderRadius: 4, marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaa', fontSize: 14,
                overflow: 'hidden',
              }}>
                {p.thumbnailUrl ? (
                  <img
                    src={`https://storage.googleapis.com/shopping-mall-public/${p.thumbnailUrl}`}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      if ((e.target as HTMLImageElement).parentElement) {
                        (e.target as HTMLImageElement).parentElement!.innerText = 'No Image'
                      }
                    }}
                  />
                ) : (
                  'No Image'
                )}
              </div>
              <h3 style={{ margin: '0 0 4px' }}>{p.name}</h3>
              <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px' }}>
                {p.sellerName} · {p.category}
              </p>
              <p style={{ fontSize: 20, fontWeight: 'bold', margin: '0 0 12px', color: '#e53935' }}>
                {p.price.toLocaleString()}원
              </p>
              <button
                onClick={() => triggerUpload(p.id)}
                disabled={isUploading}
                style={{
                  width: '100%', padding: '8px 0', border: '1px solid #1976d2',
                  borderRadius: 4, background: isUploading ? '#e3f2fd' : '#fff',
                  color: '#1976d2', cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                }}
              >
                {isUploading ? 'Uploading...' : p.thumbnailUrl ? 'Change Image' : 'Upload Image'}
              </button>
            </div>
          )
        })}
      </div>

      {!loading && products.length === 0 && (
        <p style={{ color: '#999' }}>No products available.</p>
      )}

      <footer style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #eee', color: '#999', fontSize: 13 }}>
        <p>Host: {window.location.hostname}</p>
        <p>E2E Test — Buyer Frontend → Spring API → Cloud SQL</p>
      </footer>
    </div>
  )
}

export default App
