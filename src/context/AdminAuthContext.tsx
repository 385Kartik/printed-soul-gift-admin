import React, { createContext, useContext, useState, useEffect } from "react"
import { authApi } from "../lib/api"

interface AdminUser {
  _id: string
  name: string
  email: string
  role: "admin" | "superadmin"
}

interface AdminAuthContextType {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("psg_admin_user")
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("psg_admin_token")
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("psg_admin_token")
      if (savedToken) {
        try {
          const res = await authApi.getMe()
          const me = res.data?.data?.user || res.data?.data
          if (me && (me.role === "admin" || me.role === "superadmin")) {
            setUser(me)
            localStorage.setItem("psg_admin_user", JSON.stringify(me))
          } else {
            logout()
          }
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const userData = res.data?.data?.user || res.data?.data
    const tokenData = res.data?.meta?.token || res.data?.data?.token || res.data?.token

    if (!userData || (userData.role !== "admin" && userData.role !== "superadmin")) {
      throw new Error("Access denied. Admin credentials required.")
    }
    if (!tokenData) {
      throw new Error("Authentication failed. No token received from server.")
    }

    setUser(userData)
    setToken(tokenData)
    localStorage.setItem("psg_admin_token", tokenData)
    localStorage.setItem("psg_admin_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("psg_admin_token")
    localStorage.removeItem("psg_admin_user")
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return context
}
