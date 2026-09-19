import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAdminAuth } from "./context/AdminAuthContext"
import { AdminLayout } from "./components/layouts/AdminLayout"
import { AdminLoginPage } from "./pages/auth/AdminLoginPage"
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage"
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage"
import { AdminProductsPage } from "./pages/admin/AdminProductsPage"
import { AdminProductEditPage } from "./pages/admin/AdminProductEditPage"
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage"
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage"
import { AdminRefundsPage } from "./pages/admin/AdminRefundsPage"
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage"
import { AdminBannersPage } from "./pages/admin/AdminBannersPage"
import { Loader2 } from "lucide-react"

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditPage />} />
        <Route path="products/edit/:id" element={<AdminProductEditPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="refunds" element={<AdminRefundsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
