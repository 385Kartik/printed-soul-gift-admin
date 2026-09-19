import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api"

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("psg_admin_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("psg_admin_token")
      localStorage.removeItem("psg_admin_user")
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login/password", data),
  getMe: () => api.get("/auth/me"),
}

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),

  // Categories
  getCategories: () => api.get("/admin/categories"),
  createCategory: (data: any) => api.post("/admin/categories", data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (params?: any) => api.get("/admin/products", { params }),
  createProduct: (data: any) => api.post("/admin/products", data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  // Orders & Refunds
  getOrders: (params?: any) => api.get("/orders/admin/all", { params }),
  getOrderById: (id: string) => api.get(`/orders/admin/${id}`),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    api.put(`/orders/admin/${id}/status`, data),
  pushToDelhivery: (id: string) => api.post(`/orders/admin/${id}/delhivery`),
  processRefund: (id: string, data: { refundAmount: number; refundReason: string; refundNotes?: string }) =>
    api.post(`/orders/admin/${id}/refund`, data),
  getInvoiceUrl: (id: string) => `${import.meta.env.VITE_API_URL || ""}/api/orders/${id}/invoice`,

  // Customers
  getCustomers: () => api.get("/admin/customers"),

  // Banners
  getBanners: () => api.get("/admin/banners"),
  createBanner: (data: any) => api.post("/admin/banners", data),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),

  // Addons ("Make It Special")
  getAddons: () => api.get("/admin/addons"),
  createAddon: (data: any) => api.post("/admin/addons", data),
  updateAddon: (id: string, data: any) => api.put(`/admin/addons/${id}`, data),
  deleteAddon: (id: string) => api.delete(`/admin/addons/${id}`),

  // Upload
  uploadFile: (file: File) => {
    const fd = new FormData()
    fd.append("image", file)
    return api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
  },
}
