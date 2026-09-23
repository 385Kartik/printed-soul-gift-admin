import React, { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Gift, Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { useAdminAuth } from "../../context/AdminAuthContext"

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@printedsoulgift.com")
  const [password, setPassword] = useState("Admin@Password123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to log in as admin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center mx-auto shadow-md mb-4">
            <img src="/logo.png" alt="Printed Soul Gift" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Printed Soul Gift</h2>
          <p className="text-sm text-slate-500 mt-1">Admin Portal Authentication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@printedsoulgift.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              "Sign In to Admin Portal"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Default credentials are set to seed admin credentials. Keep securely stored in production.
          </p>
        </div>
      </div>
    </div>
  )
}
