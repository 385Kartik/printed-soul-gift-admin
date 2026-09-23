import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [deleteMsg, setDeleteMsg] = useState("")

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts({
          search: search || undefined,
          category: selectedCategory || undefined,
          limit: 100,
        }),
        adminApi.getCategories(),
      ])
      setProducts(prodRes.data?.data || [])
      setCategories(catRes.data?.data || [])
    } catch (err) {
      console.error("Failed to load products", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return
    try {
      await adminApi.deleteProduct(id)
      setDeleteMsg(`Product "${name}" deleted.`)
      fetchProducts()
      setTimeout(() => setDeleteMsg(""), 4000)
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete product")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gift Products Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage gifting items, personalization options (custom text engraving & logo uploads), and stock.
          </p>
        </div>
        <Link
          to="/products/new"
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gift Product</span>
        </Link>
      </div>

      {deleteMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{deleteMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-56 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing filters or add a new gift.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-center">Personalization</th>
                  <th className="px-5 py-3 text-center">Badges</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.images?.[0])}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                        />
                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {p.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{formatPrice(p.price)}</div>
                      {p.comparePrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatPrice(p.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stock <= 5
                            ? "bg-rose-100 text-rose-700"
                            : p.stock <= 20
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {p.isPersonalizable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Sparkles className="w-3 h-3" /> Enabled
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                            Featured
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-bold uppercase">
                            Best Seller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`http://localhost:5173/products/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Store"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/products/edit/${p._id}`}
                          title="Edit Product"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          title="Delete Product"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
