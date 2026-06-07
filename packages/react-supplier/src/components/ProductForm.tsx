import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '../api'
import type { JSX } from 'react'

interface ProductResponse {
  id: number
  name: string
  description: string
  price: number
  stock: number
  status: 'draft' | 'active' | 'out_of_stock' | 'discontinued'
  category: string
  supplierId: number
  supplierName: string
  thumbnailUrl: string
  createdAt: string
  updatedAt: string
}

interface ProductFormProps {
  product: ProductResponse | null
  onClose: () => void
  onSaved: () => void
}

interface FormData {
  name: string
  description: string
  price: string
  stock: string
  status: string
  category: string
}

const emptyForm: FormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  status: 'draft',
  category: '',
}

function toFormData(p: ProductResponse | null): FormData {
  if (!p) return emptyForm
  return {
    name: p.name,
    description: p.description,
    price: String(p.price),
    stock: String(p.stock),
    status: p.status,
    category: p.category || '',
  }
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const isEdit = product !== null
  const [form, setForm] = useState<FormData>(() => toFormData(product))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  const validate = (): boolean => {
    const errors: string[] = []
    if (!form.name.trim()) errors.push('Name is required')
    const price = parseInt(form.price, 10)
    if (isEdit) {
      if (form.price && isNaN(price)) errors.push('Price must be a number')
      if (form.stock && isNaN(parseInt(form.stock, 10))) errors.push('Stock must be a number')
    } else {
      if (!form.price.trim()) errors.push('Price is required')
      else if (isNaN(price)) errors.push('Price must be a number')
      if (!form.stock.trim()) errors.push('Stock is required')
      else if (isNaN(parseInt(form.stock, 10))) errors.push('Stock must be a number')
    }
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setError(null)

    const body: Record<string, unknown> = {}
    const price = parseInt(form.price, 10)
    const stock = parseInt(form.stock, 10)

    if (isEdit) {
      if (form.name.trim()) body.name = form.name.trim()
      if (form.description) body.description = form.description
      if (form.price && !isNaN(price)) body.price = price
      if (form.stock && !isNaN(stock)) body.stock = stock
      if (form.status) body.status = form.status
      if (form.category) body.category = form.category
    } else {
      body.name = form.name.trim()
      body.price = price
      body.stock = stock
      if (form.description) body.description = form.description
      if (form.status) body.status = form.status
      if (form.category) body.category = form.category
    }

    try {
      if (isEdit) {
        await apiFetch<ProductResponse>(`/api/supplier/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      } else {
        await apiFetch<ProductResponse>('/api/supplier/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      onSaved()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed'
      setError(message)
      setSaving(false)
    }
  }

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 13,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  }

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: 14,
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: 480,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#333' }}>{isEdit ? 'Edit Product' : 'New Product'}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: '#999',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div style={{ background: '#fce4ec', border: '1px solid #c62828', borderRadius: 4, padding: 10, marginBottom: 14 }}>
            {validationErrors.map((msg, i) => (
              <p key={i} style={{ margin: 0, color: '#c62828', fontSize: 13 }}>{msg}</p>
            ))}
          </div>
        )}

        {error && (
          <p style={{ color: '#c62828', fontSize: 13, margin: '0 0 14px' }}>Error: {error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={fieldGroupStyle}>
            <label htmlFor="pf-name" style={labelStyle}>
              Name <span style={{ color: '#c62828' }}>*</span>
            </label>
            <input
              id="pf-name"
              style={inputStyle}
              value={form.name}
              onChange={set('name')}
              placeholder="Product name"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="pf-desc" style={labelStyle}>Description</label>
            <textarea
              id="pf-desc"
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={form.description}
              onChange={set('description')}
              placeholder="Product description"
            />
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="pf-price" style={labelStyle}>
                Price (원) <span style={{ color: '#c62828' }}>*</span>
              </label>
              <input
                id="pf-price"
                type="number"
                min={0}
                style={inputStyle}
                value={form.price}
                onChange={set('price')}
                placeholder="0"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pf-stock" style={labelStyle}>
                Stock <span style={{ color: '#c62828' }}>*</span>
              </label>
              <input
                id="pf-stock"
                type="number"
                min={0}
                style={inputStyle}
                value={form.stock}
                onChange={set('stock')}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="pf-status" style={labelStyle}>Status</label>
              <select
                id="pf-status"
                style={inputStyle}
                value={form.status}
                onChange={set('status')}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pf-category" style={labelStyle}>Category</label>
              <input
                id="pf-category"
                style={inputStyle}
                value={form.category}
                onChange={set('category')}
                placeholder="e.g. electronics"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: '6px 16px',
                fontSize: 13,
                color: '#666',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? '#999' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
