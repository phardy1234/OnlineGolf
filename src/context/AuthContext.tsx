import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getMe, logOut } from '../api/auth'
import type { UserProfile } from '../types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function refreshProfile() {
    const me = await getMe()
    setUser(me)
  }

  async function logout() {
    await logOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
