import React, { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { getImageUrl } from "../../lib/utils"

const OCCASIONS_LIST = [
  "Diwali",
  "Corporate",
  "Birthday",
  "Anniversary",
  "Wedding",
  "Housewarming",
  "Festive",
  "Valentine",
  "New Year",
]

const RECIPIENT_LIST = [
  "Him",
  "Her",
  "Colleagues & Clients",
  "Boss",
  "Couples",
  "Friends",
  "Parents & Family",
]

export const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")

  // Form Fields
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [comparePrice, setComparePrice] = useState<number | "">("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState<number>(100)
  const [images, setImages] = useState<string[]>([])
  const [isFeatured, setIsFeatured] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [isPersonalizable, setIsPersonalizable] = useState(false)
  const [personalizationPrompt, setPersonalizationPrompt] = useState("Enter Name or Custom Message")
  const [allowCustomImageUpload, setAllowCustomImageUpload] = useState(false)
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState("")
  const [bulkPricingTiers, setBulkPricingTiers] = useState<any[]>([
    { title: "Buy 1 Gift", subtitle: "Standard price", minQty: 1, maxQty: 1, discountPercent: 0, badgeText: "" },
    { title: "Buy 2 - 20 Gifts", subtitle: "Best option", minQty: 2, maxQty: 20, discountPercent: 45, badgeText: "Save 45%" },
    { title: "More than 21 Gifts", subtitle: "Save more", minQty: 21, maxQty: 9999, discountPercent: 48, badgeText: "Save 48%", isMostPopular: true },
  ])

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await adminApi.getCategories()
        setCategories(catRes.data?.data || [])
        if (!category && catRes.data?.data?.length > 0) {
          setCategory(catRes.data.data[0]._id)
        }

        if (isEdit && id) {
          const prodRes = await adminApi.getProducts({ limit: 100 })
          const current = prodRes.data?.data?.find((p: any) => p._id === id)
          if (current) {
            setName(current.name || "")
            setSlug(current.slug || "")
            setDescription(current.description || "")
            setPrice(current.price || "")
            setComparePrice(current.comparePrice || "")
            setCategory(typeof current.category === "object" ? current.category?._id : current.category)
            setStock(current.stock ?? 100)
            setImages(current.images || [])
            setIsFeatured(!!current.isFeatured)
            setIsBestSeller(!!current.isBestSeller)
            setIsPersonalizable(!!current.isPersonalizable)
            setPersonalizationPrompt(current.personalizationPrompt || "Enter Name or Custom Message")
            setAllowCustomImageUpload(!!current.allowCustomImageUpload)
            setSelectedOccasions(current.giftOccasions || [])
            setSelectedRecipients(current.recipient || [])
            setTagsInput(current.tags ? current.tags.join(", ") : "")
            if (current.bulkPricingTiers && current.bulkPricingTiers.length > 0) {
              setBulkPricingTiers(current.bulkPricingTiers)
            }
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product details")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const res = await adminApi.uploadFile(file)
      const url = res.data?.data?.url || res.data?.data?.path
      if (url) {
        setImages((prev) => [...prev, url])
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return
    setImages((prev) => [...prev, newImageUrl.trim()])
    setNewImageUrl("")
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    )
  }

  const toggleRecipient = (rec: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(rec) ? prev.filter((r) => r !== rec) : [...prev, rec]
    )
  }

  const handleUpdateTier = (idx: number, field: string, value: any) => {
    setBulkPricingTiers((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const handleAddTier = () => {
    setBulkPricingTiers((prev) => [
      ...prev,
      {
        title: "New Tier",
        subtitle: "",
        minQty: 1,
        maxQty: 10,
        discountPercent: 10,
        badgeText: "",
        isMostPopular: false,
      },
    ])
  }

  const handleRemoveTier = (idx: number) => {
    setBulkPricingTiers((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleResetTiers = () => {
    setBulkPricingTiers([
      { title: "Buy 1 Gift", subtitle: "Standard price", minQty: 1, maxQty: 1, discountPercent: 0, badgeText: "" },
      { title: "Buy 2 - 20 Gifts", subtitle: "Best option", minQty: 2, maxQty: 20, discountPercent: 45, badgeText: "Save 45%" },
      { title: "More than 21 Gifts", subtitle: "Save more", minQty: 21, maxQty: 9999, discountPercent: 48, badgeText: "Save 48%", isMostPopular: true },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError("Product name is required")
    if (!price || Number(price) <= 0) return setError("Valid price is required")
    if (!category) return setError("Please select a category")
    if (images.length === 0) return setError("Please add at least one product image")

    try {
      setSaving(true)
      setError("")

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        category,
        stock: Number(stock),
        images,
        isFeatured,
        isBestSeller,
        isPersonalizable,
        personalizationPrompt: isPersonalizable ? personalizationPrompt : undefined,
        allowCustomImageUpload: isPersonalizable ? allowCustomImageUpload : false,
        giftOccasions: selectedOccasions,
        recipient: selectedRecipients,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        bulkPricingTiers,
      }

      if (isEdit && id) {
        await adminApi.updateProduct(id, payload)
      } else {
        await adminApi.createProduct(payload)
      }

      navigate("/products")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Gift Product" : "Add New Gift Product"}
            </h2>
            <p className="text-xs text-slate-500">
              Specify product images, pricing, and custom engraving / logo upload options.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Diwali Dry Fruit & Diya Hamper"
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
                placeholder="auto-generated-if-empty"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="999"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="1"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="1499"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what is included in the gift hamper, materials, dimensions, and care instructions..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="diwali, dry fruit, luxury, eco-friendly"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Product Images Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">
            Product Images ({images.length})
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste image URL (e.g. Unsplash or Cloudinary)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>

            <label className="cursor-pointer px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload Local Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Product ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Tiered Pricing Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Buy More, Save More (Tiered Quantity Pricing)
              </h3>
              <p className="text-xs text-slate-500">
                Configure volume discount tiers shown on the storefront product page (Giftana style).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetTiers}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {bulkPricingTiers.map((tier, idx) => {
              const basePrice = Number(price) || 0
              const discountedUnit = Math.round(basePrice * (1 - (tier.discountPercent || 0) / 100))
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    tier.isMostPopular
                      ? "border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Tier {idx + 1}
                      {tier.isMostPopular && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold normal-case">
                          Most Popular
                        </span>
                      )}
                    </span>
                    {bulkPricingTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Tier Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={tier.title}
                        onChange={(e) => handleUpdateTier(idx, "title", e.target.value)}
                        placeholder="e.g. Buy 1 Gift, Buy 2 - 20"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Subtitle / Note
                      </label>
                      <input
                        type="text"
                        value={tier.subtitle || ""}
                        onChange={(e) => handleUpdateTier(idx, "subtitle", e.target.value)}
                        placeholder="e.g. Standard price, Best option"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Min Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={tier.minQty}
                          onChange={(e) => handleUpdateTier(idx, "minQty", Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Max Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={tier.maxQty}
                          onChange={(e) => handleUpdateTier(idx, "maxQty", Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Discount %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="95"
                          value={tier.discountPercent}
                          onChange={(e) =>
                            handleUpdateTier(idx, "discountPercent", Number(e.target.value))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-amber-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={tier.badgeText || ""}
                          onChange={(e) => handleUpdateTier(idx, "badgeText", e.target.value)}
                          placeholder="Save 45%"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!tier.isMostPopular}
                        onChange={(e) => {
                          setBulkPricingTiers((prev) =>
                            prev.map((t, i) => ({
                              ...t,
                              isMostPopular: i === idx ? e.target.checked : false,
                            }))
                          )
                        }}
                        className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                      />
                      <span className="font-medium text-[11px]">Highlight as "Most Popular"</span>
                    </label>

                    <div className="text-[11px] font-medium text-slate-500">
                      Calculated Unit Price:{" "}
                      <span className="font-bold text-slate-900">₹{discountedUnit}</span>
                      {basePrice > 0 && tier.discountPercent > 0 && (
                        <span className="line-through ml-1.5 text-slate-400">₹{basePrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Gift Personalization Controls */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-950 text-sm">
                  Gift Personalization Features
                </h3>
                <p className="text-[11px] text-amber-800">
                  Allow customers to enter a custom engraved name/message or upload a personal logo/photo.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPersonalizable}
                onChange={(e) => setIsPersonalizable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {isPersonalizable && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1">
                  Customer Prompt Label
                </label>
                <input
                  type="text"
                  value={personalizationPrompt}
                  onChange={(e) => setPersonalizationPrompt(e.target.value)}
                  placeholder="e.g. Enter Name to Engrave (Max 25 characters)"
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="customImage"
                  checked={allowCustomImageUpload}
                  onChange={(e) => setAllowCustomImageUpload(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                />
                <label htmlFor="customImage" className="text-xs font-medium text-amber-950">
                  Allow customer to upload custom photo or company logo for print
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Gift Occasions & Recipient Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">
            Target Occasions & Recipients
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Gift Occasions
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS_LIST.map((occ) => {
                const active = selectedOccasions.includes(occ)
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {occ}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Gift For (Recipient)
            </label>
            <div className="flex flex-wrap gap-2">
              {RECIPIENT_LIST.map((rec) => {
                const active = selectedRecipients.includes(rec)
                return (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => toggleRecipient(rec)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {rec}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-slate-700">Mark as Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs font-medium text-slate-700">Mark as Best Seller</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEdit ? "Update Product" : "Publish Gift Product"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
