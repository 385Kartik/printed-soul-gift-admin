import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { RotateCcw, Search, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, formatDate } from "../../lib/utils"

export const AdminRefundsPage: React.FC = () => {
  const [refundedOrders, setRefundedOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        setLoading(true)
        const res = await adminApi.getOrders({ status: "refunded", limit: 100 })
        setRefundedOrders(res.data?.data || [])
      } catch (err) {
        console.error("Failed to load refunds", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRefunds()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Refund Requests & History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and track all refunded orders, reasons, customer notifications, and amounts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading refunds...</p>
          </div>
        ) : refundedOrders.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No refunds issued yet</p>
            <p className="text-xs text-slate-400 mt-1">Refunded orders will be logged here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Refund Amount</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Refunded At</th>
                  <th className="px-5 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {refundedOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{o.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800 block">
                        {o.shippingAddress?.fullName || o.user?.name || "Customer"}
                      </span>
                      <span className="text-[10px] text-slate-400">{o.shippingAddress?.city}</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-rose-600">
                      {formatPrice(o.refundDetails?.amount || o.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-slate-700 truncate">
                        {o.refundDetails?.reason || "Customer cancellation"}
                      </p>
                      {o.refundDetails?.notes && (
                        <p className="text-[10px] text-slate-400 truncate">
                          Note: {o.refundDetails.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDate(o.refundDetails?.refundedAt || o.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/orders/${o._id}`}
                        className="text-amber-600 hover:text-amber-700 font-semibold"
                      >
                        View &rarr;
                      </Link>
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
