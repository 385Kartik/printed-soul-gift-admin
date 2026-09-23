import React, { useState, useEffect } from "react"
import { Users, Mail, Phone, Calendar, Loader2 } from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatDate } from "../../lib/utils"

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const res = await adminApi.getCustomers()
        setCustomers(res.data?.data || [])
      } catch (err) {
        console.error("Failed to load customers", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Registered Customers</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          List of users registered with email OTP or password authentication.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No customers registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {c.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-semibold text-slate-900">{c.name || "Customer"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{c.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.phone || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.isVerified ? "Verified" : "Unverified"}
                      </span>
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
