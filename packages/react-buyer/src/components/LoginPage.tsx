import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  variant?: 'modal' | 'page'
}

function LoginForm() {
  const { login, closeLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, color: '#333', fontSize: 13, fontWeight: 'bold' }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4,
            fontSize: 14, boxSizing: 'border-box',
          }}
          autoFocus
          required
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 4, color: '#333', fontSize: 13, fontWeight: 'bold' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4,
            fontSize: 14, boxSizing: 'border-box',
          }}
          required
        />
      </div>

      {error && (
        <p style={{ color: '#c62828', fontSize: 13, margin: '0 0 16px' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', padding: '10px 0', background: '#333', color: '#fff',
          border: 'none', borderRadius: 4, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default function LoginPage({ variant = 'modal' }: Props) {
  const { closeLogin } = useAuth()

  if (variant === 'page') {
    return (
      <div style={{ maxWidth: 360, margin: '80px auto', padding: 24 }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 32, background: '#fff' }}>
          <h1 style={{ margin: '0 0 8px', color: '#333', fontSize: 24 }}>GKE Shop</h1>
          <p style={{ color: '#666', margin: '0 0 24px', fontSize: 14 }}>Buyer Login</p>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) closeLogin() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 360, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#333' }}>Login</h2>
          <button
            onClick={closeLogin}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', padding: '4px 8px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
