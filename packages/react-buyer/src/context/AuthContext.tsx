import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface AuthState {
  token: string | null
  role: string | null
  username: string | null
  showLogin: boolean
  openLogin: () => void
  closeLogin: () => void
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('buyer_token')
    const storedRole = localStorage.getItem('buyer_role')
    const storedUsername = localStorage.getItem('buyer_username')
    if (storedToken) {
      setToken(storedToken)
      setRole(storedRole)
      setUsername(storedUsername)
    }
  }, [])

  const login = useCallback(async (loginUsername: string, password: string) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername, password }),
    })
    if (!res.ok) {
      if (res.status === 401) throw new Error('Invalid credentials')
      throw new Error(`Login failed: HTTP ${res.status}`)
    }
    const data = await res.json()
    localStorage.setItem('buyer_token', data.token)
    localStorage.setItem('buyer_role', data.role || 'BUYER')
    localStorage.setItem('buyer_username', loginUsername)
    setToken(data.token)
    setRole(data.role || 'BUYER')
    setUsername(loginUsername)
    setShowLogin(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('buyer_token')
    localStorage.removeItem('buyer_role')
    localStorage.removeItem('buyer_username')
    setToken(null)
    setRole(null)
    setUsername(null)
  }, [])

  const openLogin = useCallback(() => setShowLogin(true), [])
  const closeLogin = useCallback(() => setShowLogin(false), [])

  return (
    <AuthContext.Provider value={{ token, role, username, showLogin, openLogin, closeLogin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
