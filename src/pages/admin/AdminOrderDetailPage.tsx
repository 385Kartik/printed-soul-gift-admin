import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Truck,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  MapPin,
  User,
  CreditCard,
  Package,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, formatDate, getImageUrl } from "../../lib/utils"

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Status update state
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number | "">("")
  const [refundReason, setRefundReason] = useState("Customer requested cancellation")
  const [refundNotes, setRefundNotes] = useState("")
  const [processingRefund, setProcessingRefund] = useState(false)

  const fetchOrder = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await adminApi.getOrderById(id)
      setOrder(res.data?.data)
      setNewStatus(res.data?.data?.status || "pending")
      if (res.data?.data?.totalAmount) {
        setRefundAmount(res.data.data.totalAmount)
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Failed to load order details",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      await adminApi.updateOrderStatus(id, {
        status: newStatus,
        note: statusNote || undefined,
      })
      setFeedback({ type: "success", msg: `Order status updated to ${newStatus}` })
      setStatusNote("")
      fetchOrder()
      setTimeout(() => setFeedback(null), 4000)
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Failed to update status",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePushDelhivery = async () => {
    if (!id) return
    if (!window.confirm("Submit shipment package to Delhivery logistics API?")) return

    try {
      setActionLoading(true)
      const res = await adminApi.pushToDelhivery(id)
      setFeedback({
        type: "success",
        msg: `Shipment booked with Delhivery! AWB: ${res.data?.data?.delhiveryAwb || "Assigned"}`,
      })
      fetchOrder()
      setTimeout(() => setFeedback(null), 5000)
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Delhivery dispatch failed",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !refundAmount || Number(refundAmount) <= 0) return

    try {
      setProcessingRefund(true)
      await adminApi.processRefund(id, {
        refundAmount: Number(refundAmount),
        refundReason,
        refundNotes,
      })
      setRefundModalOpen(false)
      setFeedback({
        type: "success",
        msg: `Refund of ₹${refundAmount} recorded. Customer notified via email.`,
      })
      fetchOrder()
      setTimeout(() => setFeedback(null), 5000)
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Refund processing failed",
      })
    } finally {
      setProcessingRefund(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-800">Order not found</p>
        <Link to="/orders" className="text-xs text-amber-600 hover:underline mt-2 inline-block">
          &larr; Back to all orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{order.orderNumber}</h2>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  order.status === "delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.status === "shipped"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "processing"
                    ? "bg-amber-100 text-amber-800"
                    : order.status === "refunded"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={adminApi.getInvoiceUrl(order._id)}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Tax Invoice PDF</span>
          </a>

          {order.status !== "refunded" && (
            <button
              onClick={() => setRefundModalOpen(true)}
              className="px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Process Refund</span>
            </button>
          )}
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

      {/* Delhivery Integration Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 block">
                Delhivery Shipping Integration
              </span>
              {order.delhiveryAwb ? (
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-base font-bold text-white">
                    AWB: {order.delhiveryAwb}
                  </span>
                  <a
                    href={order.delhiveryTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    <span>Track Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-blue-200 mt-1">
                  Waybill has not been generated for this shipment yet.
                </p>
              )}
            </div>
          </div>

          {!order.delhiveryAwb && order.status !== "cancelled" && (
            <button
              onClick={handlePushDelhivery}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              <span>Create Delhivery Shipment</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Ordered Items & Shipping Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordered Items (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Gifts Ordered ({order.items?.length || 0})</span>
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className={`${idx > 0 ? "pt-4" : ""}`}>
                  <div className="flex items-start gap-4">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatPrice(item.price)} &times; {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Gift Personalization Render */}
                      {(item.customText || item.customImage) && (
                        <div className="mt-3 p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Gift Personalization Specifications:</span>
                          </div>

                          {item.customText && (
                            <div className="text-xs text-purple-950">
                              <span className="font-semibold text-purple-800">
                                Engraved Text / Name:
                              </span>{" "}
                              <span className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200">
                                &quot;{item.customText}&quot;
                              </span>
                            </div>
                          )}

                          {item.customImage && (
                            <div className="pt-1">
                              <span className="text-xs font-semibold text-purple-800 block mb-1">
                                Customer Uploaded Logo / Photo:
                              </span>
                              <div className="flex items-center gap-3">
                                <a
                                  href={getImageUrl(item.customImage)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={getImageUrl(item.customImage)}
                                    alt="Uploaded design"
                                    className="w-14 h-14 rounded-lg object-cover border-2 border-purple-300 shadow-sm hover:scale-105 transition-transform"
                                  />
                                </a>
                                <a
                                  href={getImageUrl(item.customImage)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-1"
                                >
                                  <span>View High-Res Photo</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Cost (Delhivery)</span>
                <span>{order.shippingCost ? formatPrice(order.shippingCost) : "FREE"}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount Paid</span>
                <span className="text-amber-700">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status Changer Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">
              Update Fulfillment Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Status Note
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Gift box packed with festive ribbon"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={actionLoading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Status Change</span>
            </button>
          </div>
        </div>

        {/* Sidebar: Customer & Payment Details (1 Col) */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wider text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400" />
              Delivery Address
            </h3>

            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {order.shippingAddress?.postalCode}
                </span>
              </p>
              <p className="pt-2 font-medium text-slate-800">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wider text-slate-500">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Payment Details
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {order.paymentMethod || "PayU"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold capitalize px-2 py-0.5 rounded text-[10px] ${
                    order.paymentStatus === "paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentDetails?.txnid && (
                <div className="flex justify-between">
                  <span className="text-slate-500">PayU Txn ID:</span>
                  <span className="font-mono text-[10px] text-slate-800 truncate max-w-[120px]">
                    {order.paymentDetails.txnid}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Details (if any) */}
          {order.refundDetails?.refundedAt && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm space-y-2 text-xs text-rose-900">
              <div className="flex items-center gap-2 font-bold text-rose-950">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Refund Processed</span>
              </div>
              <div className="space-y-1 pt-1">
                <p>
                  <strong>Amount:</strong> {formatPrice(order.refundDetails.amount)}
                </p>
                <p>
                  <strong>Reason:</strong> {order.refundDetails.reason}
                </p>
                <p className="text-[11px] text-rose-700">
                  Processed on {formatDate(order.refundDetails.refundedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Process Order Refund</h3>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={order.totalAmount}
                  value={refundAmount}
                  onChange={(e) =>
                    setRefundAmount(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Refund *
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Additional notes for bookkeeping..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {processingRefund && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
