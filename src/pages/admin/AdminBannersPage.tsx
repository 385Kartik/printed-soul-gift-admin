import React, { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Upload, Loader2, CheckCircle2, Image as ImageIcon, X } from "lucide-react"
import { adminApi } from "../../lib/api"
import { getImageUrl } from "../../lib/utils"

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  // Form Fields
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [tag, setTag] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [link, setLink] = useState("/products")
  const [buttonText, setButtonText] = useState("Shop Collection")
  const [type, setType] = useState<"hero" | "promo" | "strip">("hero")
  const [order, setOrder] = useState(1)

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getBanners()
      setBanners(res.data?.data || [])
    } catch (err) {
      console.error("Failed to load banners", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const openAddModal = () => {
    setEditingBanner(null)
    setTitle("")
    setSubtitle("")
    setTag("Festive Gifting 2026")
    setImageUrl("")
    setLink("/products")
    setButtonText("Explore Now")
    setType("hero")
    setOrder(banners.length + 1)
    setModalOpen(true)
  }

  const openEditModal = (b: any) => {
    setEditingBanner(b)
    setTitle(b.title)
    setSubtitle(b.subtitle || "")
    setTag(b.tag || "")
    setImageUrl(b.imageUrl)
    setLink(b.link || "/products")
    setButtonText(b.buttonText || "Shop Now")
    setType(b.type || "hero")
    setOrder(b.order || 1)
    setModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const res = await adminApi.uploadFile(file)
      setImageUrl(res.data?.data?.url || res.data?.data?.path)
    } catch (err) {
      alert("Image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !imageUrl) return alert("Title and image are required")

    try {
      setSaving(true)
      const payload = {
        title,
        subtitle,
        tag,
        imageUrl,
        link,
        buttonText,
        type,
        order: Number(order),
      }

      if (editingBanner) {
        await adminApi.updateBanner(editingBanner._id, payload)
        setMsg("Banner updated successfully!")
      } else {
        await adminApi.createBanner(payload)
        setMsg("Banner published successfully!")
      }

      setModalOpen(false)
      fetchBanners()
      setTimeout(() => setMsg(""), 4000)
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save banner")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return
    try {
      await adminApi.deleteBanner(id)
      fetchBanners()
    } catch (err: any) {
      alert("Failed to delete banner")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Promotional Banners</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the homepage hero slideshow and festive announcement banners.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No banners added yet</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100">
                <img
                  src={getImageUrl(b.imageUrl)}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {b.type} • Slide #{b.order}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {b.tag && (
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      {b.tag}
                    </span>
                  )}
                  <h3 className="font-serif font-bold text-slate-900 text-base">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.subtitle}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Link: {b.link}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBanner ? "Edit Banner" : "New Promotional Banner"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Diwali Gift Hampers"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tag / Mini Header
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. Festive Special 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Celebrate relationships with bespoke gift sets..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL / Upload *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
