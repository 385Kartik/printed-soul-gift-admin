import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  ShoppingBag,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, formatDate } from "../../lib/utils"

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        limit: 100,
      })
      setOrders(res.data?.data || [])
    } catch (err) {
      console.error("Failed to load orders", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, paymentFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const handlePushToDelhivery = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Generate Delhivery shipping waybill for order ${orderNumber}?`)) return

    try {
      setActionLoading(orderId)
      const res = await adminApi.pushToDelhivery(orderId)
      setFeedback({
        type: "success",
        msg: `Delhivery shipment generated! AWB: ${res.data?.data?.delhiveryAwb || "Assigned"}`,
      })
      fetchOrders()
      setTimeout(() => setFeedback(null), 5000)
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Failed to generate Delhivery shipment",
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders & Shipping Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor customer orders, dispatch Delhivery packages, track AWB status, and manage refunds.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order #, customer or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid (PayU / COD)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Order # & Date</th>
                  <th className="px-5 py-3">Customer & Shipping</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Delhivery AWB</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/orders/${o._id}`}
                        className="font-bold text-amber-700 hover:text-amber-800 hover:underline block"
                      >
                        {o.orderNumber}
                      </Link>
                      <span className="text-[11px] text-slate-400">{formatDate(o.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">
                        {o.shippingAddress?.fullName || o.user?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {o.shippingAddress?.city}, {o.shippingAddress?.postalCode}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {o.items?.length || 0} gift(s)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          o.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : o.paymentStatus === "refunded"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {o.paymentMethod?.toUpperCase()} • {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {o.delhiveryAwb ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-700">
                          <Truck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{o.delhiveryAwb}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePushToDelhivery(o._id, o.orderNumber)}
                          disabled={actionLoading === o._id}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === o._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                          <span>Ship Delhivery</span>
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : o.status === "processing"
                            ? "bg-amber-100 text-amber-800"
                            : o.status === "refunded"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={adminApi.getInvoiceUrl(o._id)}
                          target="_blank"
                          rel="noreferrer"
                          title="Download Tax Invoice PDF"
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/orders/${o._id}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
