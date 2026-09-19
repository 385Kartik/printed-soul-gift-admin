import React, { useState, useEffect } from "react"
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  FolderTree,
  Package,
  Layers,
  Upload,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { formatPrice, getImageUrl } from "../../lib/utils"

interface Variant {
  name: string
  price: number
  image?: string
}

interface Addon {
  _id: string
  title: string
  type: string
  image?: string
  variants: Variant[]
  requiresMessage: boolean
  messagePlaceholder?: string
  appliesTo: "all" | "categories" | "products"
  applicableCategories?: any[]
  applicableProducts?: any[]
  isActive: boolean
  sortOrder: number
}

export const AdminAddonsPage: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("custom")
  const [image, setImage] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [requiresMessage, setRequiresMessage] = useState(false)
  const [messagePlaceholder, setMessagePlaceholder] = useState("Write A Message")
  const [appliesTo, setAppliesTo] = useState<"all" | "categories" | "products">("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)

  // Variant input helper
  const [newVarName, setNewVarName] = useState("")
  const [newVarPrice, setNewVarPrice] = useState<number | "">("")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [addonRes, catRes, prodRes] = await Promise.all([
        adminApi.getAddons(),
        adminApi.getCategories(),
        adminApi.getProducts({ limit: 100 }),
      ])
      setAddons(addonRes.data.data || [])
      setCategories(catRes.data.data || [])
      setProducts(prodRes.data.data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitle("")
    setType("custom")
    setImage("")
    setVariants([
      { name: "Standard Option", price: 50 },
    ])
    setRequiresMessage(false)
    setMessagePlaceholder("Write A Message")
    setAppliesTo("all")
    setSelectedCategories([])
    setSelectedProducts([])
    setIsActive(true)
    setSortOrder(addons.length + 1)
    setError("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (a: Addon) => {
    setEditingId(a._id)
    setTitle(a.title)
    setType(a.type || "custom")
    setImage(a.image || "")
    setVariants(a.variants || [])
    setRequiresMessage(Boolean(a.requiresMessage))
    setMessagePlaceholder(a.messagePlaceholder || "Write A Message")
    setAppliesTo(a.appliesTo || "all")
    setSelectedCategories((a.applicableCategories || []).map((c: any) => c._id || c))
    setSelectedProducts((a.applicableProducts || []).map((p: any) => p._id || p))
    setIsActive(a.isActive)
    setSortOrder(a.sortOrder || 0)
    setError("")
    setIsModalOpen(true)
  }

  const handleAddVariant = () => {
    if (!newVarName.trim() || newVarPrice === "") return
    setVariants([...variants, { name: newVarName.trim(), price: Number(newVarPrice) }])
    setNewVarName("")
    setNewVarPrice("")
  }

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please provide an add-on title.")
      return
    }
    if (variants.length === 0) {
      setError("Please add at least one variant / option.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const payload = {
        title: title.trim(),
        type,
        image,
        variants,
        requiresMessage,
        messagePlaceholder: messagePlaceholder.trim(),
        appliesTo,
        applicableCategories: selectedCategories,
        applicableProducts: selectedProducts,
        isActive,
        sortOrder,
      }

      if (editingId) {
        await adminApi.updateAddon(editingId, payload)
      } else {
        await adminApi.createAddon(payload)
      }
      setIsModalOpen(false)
      fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save add-on")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await adminApi.deleteAddon(id)
      fetchAll()
    } catch (err: any) {
      alert("Failed to delete add-on")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Make It Special (Add-ons &amp; Extras)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Giftana-style extra add-ons (Chocolates, Gift Wrap, Greeting Cards) with custom message inputs and per-category/product targeting.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Special Add-on</span>
        </button>
      </div>

      {/* Addons List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading add-ons...</div>
      ) : addons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">No Add-ons Configured Yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create add-on options like greeting cards, luxury gift wrap, and chocolates.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
          >
            Create First Add-on
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addons.map((addon) => {
            const minPrice = addon.variants?.length
              ? Math.min(...addon.variants.map((v) => v.price))
              : 0
            const maxPrice = addon.variants?.length
              ? Math.max(...addon.variants.map((v) => v.price))
              : 0

            return (
              <div
                key={addon._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={getImageUrl(addon.image)}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{addon.title}</h3>
                        {addon.isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" title="Inactive" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {addon.variants?.length || 0} Options •{" "}
                        <span className="font-semibold text-slate-800">
                          {minPrice === maxPrice
                            ? formatPrice(minPrice)
                            : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Badges / Features */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {addon.requiresMessage && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                        <MessageSquare className="w-3 h-3" />
                        <span>Customer Note / Message Box</span>
                      </span>
                    )}
                    {addon.appliesTo === "all" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                        <Layers className="w-3 h-3" />
                        <span>All Products</span>
                      </span>
                    ) : addon.appliesTo === "categories" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-200">
                        <FolderTree className="w-3 h-3" />
                        <span>{addon.applicableCategories?.length || 0} Categories</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200">
                        <Package className="w-3 h-3" />
                        <span>{addon.applicableProducts?.length || 0} Products</span>
                      </span>
                    )}
                  </div>

                  {/* Variants Snippet */}
                  <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                      Options Preview:
                    </p>
                    <ul className="space-y-0.5">
                      {addon.variants.slice(0, 3).map((v, i) => (
                        <li key={i} className="flex justify-between truncate">
                          <span className="truncate">{v.name}</span>
                          <span className="font-semibold text-slate-900 ml-2">
                            {formatPrice(v.price)}
                          </span>
                        </li>
                      ))}
                      {addon.variants.length > 3 && (
                        <li className="text-slate-400 text-[10px] italic">
                          +{addon.variants.length - 3} more options
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Order: {addon.sortOrder}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(addon)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Add-on"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addon._id, addon.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Add-on"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{editingId ? "Edit Special Add-on" : "Create Special Add-on"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Add-on Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Greeting Card, Chocolates, Gift Wrap"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    <option value="card">Greeting Card (✉️)</option>
                    <option value="wrap">Gift Wrap (🎁)</option>
                    <option value="chocolate">Chocolates (🍫)</option>
                    <option value="custom">Other Custom Add-on</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* CUSTOMER MESSAGE CHECKBOX (Core User Requirement) */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresMessage}
                    onChange={(e) => setRequiresMessage(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Ask Customer For Custom Message / Note?
                    </span>
                    <span className="text-[11px] text-amber-800">
                      When ticked, adding this item in the store will display a text area (e.g. for greeting card messages).
                    </span>
                  </div>
                </label>

                {requiresMessage && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Text Area Placeholder / Label
                    </label>
                    <input
                      type="text"
                      value={messagePlaceholder}
                      onChange={(e) => setMessagePlaceholder(e.target.value)}
                      placeholder="e.g. Write A Message On Greeting Card"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                )}
              </div>

              {/* VARIANTS BUILDER */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Variants &amp; Options (Dropdown choices) *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-800 truncate flex-1">{v.name}</span>
                      <span className="font-bold text-slate-900">{formatPrice(v.price)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Variant Form */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="Option name (e.g. Happy Birthday Card)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newVarPrice}
                    onChange={(e) =>
                      setNewVarPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Price (₹)"
                    className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* TARGETING / APPLICABILITY */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Where should this add-on appear?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Products (Global)" },
                    { id: "categories", label: "Specific Categories" },
                    { id: "products", label: "Specific Products" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAppliesTo(opt.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        appliesTo === opt.id
                          ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Categories Checklist */}
                {appliesTo === "categories" && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Select Applicable Categories:
                    </p>
                    {categories.map((c) => (
                      <label key={c._id} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, c._id])
                            } else {
                              setSelectedCategories(selectedCategories.filter((id) => id !== c._id))
                            }
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Products Checklist */}
                {appliesTo === "products" && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Select Applicable Products:
                    </p>
                    {products.map((p) => (
                      <label key={p._id} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer truncate">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(p._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, p._id])
                            } else {
                              setSelectedProducts(selectedProducts.filter((id) => id !== p._id))
                            }
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Sort Order */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">Active (Visible in Store)</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-600">Sort Order:</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {saving ? "Saving..." : editingId ? "Update Add-on" : "Create Add-on"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
