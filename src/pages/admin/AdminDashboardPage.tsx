import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  RotateCcw,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, formatDate } from "../../lib/utils"

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard()
        setStats(res.data?.data)
      } catch (err) {
        console.error("Failed to load dashboard metrics", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: "bg-emerald-500 text-white",
      sub: "From settled payments",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "bg-blue-500 text-white",
      sub: "All-time store orders",
    },
    {
      title: "Pending Dispatch",
      value: stats?.pendingProcessing || 0,
      icon: Clock,
      color: "bg-amber-500 text-white",
      sub: "Requires Delhivery waybill",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "bg-purple-500 text-white",
      sub: "Registered user accounts",
    },
    {
      title: "Refunded Orders",
      value: stats?.totalRefunds || 0,
      icon: RotateCcw,
      color: "bg-rose-500 text-white",
      sub: "Processed refunds",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-200 text-xs uppercase font-bold tracking-widest block mb-1">
            Gifting Platform Overview
          </span>
          <h2 className="text-2xl font-serif font-bold">Welcome back to Printed Soul Gift Admin</h2>
          <p className="text-white/80 text-sm mt-1">
            Configure dynamic navbar categories, manage gift personalization, and fulfill Delhivery shipments.
          </p>
        </div>
        <Link
          to="/categories"
          className="px-4 py-2.5 bg-white text-slate-900 rounded-xl font-semibold text-xs shadow hover:bg-amber-50 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <span>Manage Dynamic Navbar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Store Orders</h3>
              <p className="text-xs text-slate-500">Latest customer orders awaiting fulfillment</p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  stats?.recentOrders?.map((order: any) => (
                    <tr key={order._id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800 block">
                          {order.shippingAddress?.fullName || order.user?.name || "Guest"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.shippingAddress?.city || "India"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-700"
                              : order.status === "processing"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-semibold text-slate-900 text-sm">Low Stock Inventory</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Products that have 5 or fewer items remaining.
            </p>

            {stats?.lowStockProducts?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                All products have healthy inventory levels.
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.lowStockProducts?.map((p: any) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">{p.name}</h4>
                        <p className="text-[11px] text-slate-500">{formatPrice(p.price)}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md flex-shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/products"
              className="w-full block py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Update Product Stock
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
