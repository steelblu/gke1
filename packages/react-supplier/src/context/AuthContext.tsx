import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface AuthState {
  token: string | null
  role: string | null
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('supplier_token')
    const storedRole = localStorage.getItem('supplier_role')
    const storedUsername = localStorage.getItem('supplier_username')
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
    const roleValue = data.role || 'SUPPLIER'
    localStorage.setItem('supplier_token', data.token)
    localStorage.setItem('supplier_role', roleValue)
    localStorage.setItem('supplier_username', loginUsername)
    setToken(data.token)
    setRole(roleValue)
    setUsername(loginUsername)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('supplier_token')
    localStorage.removeItem('supplier_role')
    localStorage.removeItem('supplier_username')
    setToken(null)
    setRole(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
