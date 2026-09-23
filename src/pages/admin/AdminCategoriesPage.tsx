import React, { useState, useEffect } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  Navigation,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  FolderPlus,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { getImageUrl } from "../../lib/utils"

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  showOnNavbar: boolean
  navDisplayName?: string
  showOnHome: boolean
  homeOrder: number
  sortOrder: number
  parentCategory?: string | { _id: string; name: string; slug: string }
  isActive: boolean
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [parentCategory, setParentCategory] = useState("")
  const [showOnNavbar, setShowOnNavbar] = useState(true)
  const [navDisplayName, setNavDisplayName] = useState("")
  const [showOnHome, setShowOnHome] = useState(true)
  const [homeOrder, setHomeOrder] = useState(0)
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getCategories()
      setCategories(res.data?.data || [])
    } catch (err) {
      console.error("Failed to load categories", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAddModal = () => {
    setEditingCategory(null)
    setName("")
    setSlug("")
    setDescription("")
    setImage("")
    setParentCategory("")
    setShowOnNavbar(true)
    setNavDisplayName("")
    setShowOnHome(true)
    setHomeOrder(categories.length + 1)
    setSortOrder(categories.length + 1)
    setIsActive(true)
    setError("")
    setModalOpen(true)
  }

  const openAddSubModal = (parentId?: string) => {
    setEditingCategory(null)
    setName("")
    setSlug("")
    setDescription("")
    setImage("")
    const topCat = categories.find((c) => !c.parentCategory)
    setParentCategory(parentId || topCat?._id || "")
    setShowOnNavbar(true)
    setNavDisplayName("")
    setShowOnHome(false)
    setHomeOrder(0)
    setSortOrder(categories.length + 1)
    setIsActive(true)
    setError("")
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || "")
    setImage(cat.image || "")
    const pId = typeof cat.parentCategory === "object" ? cat.parentCategory?._id || "" : cat.parentCategory || ""
    setParentCategory(pId)
    setShowOnNavbar(cat.showOnNavbar)
    setNavDisplayName(cat.navDisplayName || cat.name)
    setShowOnHome(cat.showOnHome)
    setHomeOrder(cat.homeOrder || 0)
    setSortOrder(cat.sortOrder || 0)
    setIsActive(cat.isActive)
    setError("")
    setModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const res = await adminApi.uploadFile(file)
      setImage(res.data?.data?.url || res.data?.data?.path)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Category name is required")
      return
    }

    try {
      setSaving(true)
      setError("")

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description,
        image,
        parentCategory: parentCategory || null,
        showOnNavbar,
        navDisplayName: navDisplayName.trim() || name.trim(),
        showOnHome,
        homeOrder: Number(homeOrder),
        sortOrder: Number(sortOrder),
        isActive,
      }

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, payload)
        setSuccessMsg(`Category "${name}" updated successfully!`)
      } else {
        await adminApi.createCategory(payload)
        setSuccessMsg(`Category "${name}" added! It is now live on the store.`)
      }

      setModalOpen(false)
      fetchCategories()
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return

    try {
      await adminApi.deleteCategory(id)
      setSuccessMsg(`Category "${catName}" removed.`)
      fetchCategories()
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Feature Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories & Dynamic Navigation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure which categories appear in the customer website navbar and homepage showcase.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Main Category</span>
          </button>
          <button
            onClick={() => openAddSubModal()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>+ Add Sub-Category</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Tip Banner */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">Dynamic Storefront Rule:</p>
          <p className="text-amber-800 mt-0.5">
            Enable <strong>Show on Navbar</strong> and enter a custom <strong>Navbar Display Name</strong> (e.g. &quot;Diwali Hampers&quot;) to immediately pin it to the customer store header. Enable <strong>Show on Home</strong> to present it in the circular category bubble strip on the homepage!
          </p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-600">No categories created yet.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs text-amber-600 hover:underline font-semibold"
            >
              Create your first gift category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3 text-center">Show in Navbar</th>
                  <th className="px-5 py-3">Navbar Display Label</th>
                  <th className="px-5 py-3 text-center">Show on Home</th>
                  <th className="px-5 py-3 text-center">Orders (Nav/Home)</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((cat) => {
                  const parentName =
                    typeof cat.parentCategory === "object"
                      ? cat.parentCategory?.name
                      : categories.find((c) => c._id === cat.parentCategory)?.name
                  const isSub = !!cat.parentCategory

                  return (
                    <tr
                      key={cat._id}
                      className={`hover:bg-slate-50/70 ${isSub ? "bg-amber-50/20" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {isSub && (
                            <span className="text-amber-500 font-mono text-sm font-bold pl-2">
                              └─
                            </span>
                          )}
                          <img
                            src={getImageUrl(cat.image)}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{cat.name}</p>
                              {isSub ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  Sub of {parentName}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  Main Category
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {cat.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                      /{cat.slug}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cat.showOnNavbar ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          <XCircle className="w-3 h-3" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        {cat.navDisplayName || cat.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cat.showOnHome ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          <XCircle className="w-3 h-3" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-[11px] text-slate-600">
                      Nav #{cat.sortOrder} | Home #{cat.homeOrder}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cat.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isSub && (
                          <button
                            onClick={() => openAddSubModal(cat._id)}
                            title="Add sub-category under this category"
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                            <span>+ Sub-category</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Edit Category"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          title="Delete Category"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                {editingCategory ? "Edit Category & Navbar Config" : "Create New Gift Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingCategory && !navDisplayName) {
                        setNavDisplayName(e.target.value)
                      }
                    }}
                    placeholder="e.g. Diwali Gift Hampers"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
                  />
                </div>
              </div>

              {/* Parent Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Category (Leave empty for Main / Top-Level Category)
                </label>
                <select
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
                >
                  <option value="">None — Top Level Main Category</option>
                  {categories
                    .filter((c) => !editingCategory || c._id !== editingCategory._id)
                    .filter((c) => !c.parentCategory) // only allow top-level categories as parents
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        📁 {c.name}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  If selected, this category will become a sub-category nested under the parent category.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short marketing blurb for the category banner..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Image Input / Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Display Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://... or upload below"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
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
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={getImageUrl(image)}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <span className="text-[11px] text-slate-500 truncate">{image}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Navbar Controls Box */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    Storefront Navbar Integration
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnNavbar}
                      onChange={(e) => setShowOnNavbar(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {showOnNavbar && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Navbar Display Label *
                      </label>
                      <input
                        type="text"
                        value={navDisplayName}
                        onChange={(e) => setNavDisplayName(e.target.value)}
                        placeholder="Custom label in top menu"
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                      <span className="text-[10px] text-amber-700 block mt-0.5">
                        Can be different from category name.
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Navbar Position / Priority
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                      <span className="text-[10px] text-amber-700 block mt-0.5">
                        Lower numbers appear first (e.g. 1, 2, 3)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Homepage Showcase Controls */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Homepage Circular Strip Visibility
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnHome}
                      onChange={(e) => setShowOnHome(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>

                {showOnHome && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Homepage Display Position
                    </label>
                    <input
                      type="number"
                      value={homeOrder}
                      onChange={(e) => setHomeOrder(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Category Status</span>
                  <span className="text-[11px] text-slate-400">
                    Inactive categories won't show anywhere on customer website
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Save & Make Live"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
