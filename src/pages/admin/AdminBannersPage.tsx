import React, { useState, useEffect } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Film,
  X,
  Maximize2,
  Sparkles,
  Layers,
  MonitorPlay,
} from "lucide-react"
import { adminApi } from "../../lib/api"
import { getImageUrl } from "../../lib/utils"

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  // Form Fields
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [tag, setTag] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [size, setSize] = useState<"auto" | "slim" | "medium" | "full">("auto")
  const [position, setPosition] = useState<"hero" | "middle" | "bottom">("hero")
  const [link, setLink] = useState("/products")
  const [buttonText, setButtonText] = useState("Shop Collection")
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
    setTag("Curated Collection")
    setImageUrl("")
    setVideoUrl("")
    setMediaType("image")
    setSize("auto")
    setPosition("hero")
    setLink("/products")
    setButtonText("Explore Now")
    setOrder(banners.length + 1)
    setModalOpen(true)
  }

  const openEditModal = (b: any) => {
    setEditingBanner(b)
    setTitle(b.title || "")
    setSubtitle(b.subtitle || "")
    setTag(b.tag || "")
    setImageUrl(b.imageUrl || "")
    setVideoUrl(b.videoUrl || "")
    setMediaType(b.mediaType || (b.videoUrl ? "video" : "image"))
    setSize(b.size || "auto")
    setPosition(b.position || (b.type === "middle" ? "middle" : b.type === "bottom" ? "bottom" : "hero"))
    setLink(b.link || "/products")
    setButtonText(b.buttonText || "Shop Now")
    setOrder(b.order !== undefined ? b.order : 1)
    setModalOpen(true)
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name)

    try {
      setUploadingMedia(true)
      const res = await adminApi.uploadFile(file)
      const uploadedUrl = res.data?.data?.url || res.data?.data?.path

      if (isVideo) {
        setMediaType("video")
        setVideoUrl(uploadedUrl)
        setImageUrl(uploadedUrl)
      } else {
        setImageUrl(uploadedUrl)
      }
    } catch (err) {
      alert("Media upload failed. Maximum allowed file size is 60MB.")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return alert("Banner title is required")
    if (mediaType === "video" && !videoUrl && !imageUrl) {
      return alert("Video URL or video upload is required for video banner")
    }
    if (mediaType === "image" && !imageUrl) {
      return alert("Image URL or image upload is required")
    }

    try {
      setSaving(true)
      const payload = {
        title,
        subtitle,
        tag,
        imageUrl: imageUrl || videoUrl,
        videoUrl: mediaType === "video" ? videoUrl || imageUrl : "",
        mediaType,
        size,
        position,
        type: position,
        link,
        buttonText,
        order: Number(order),
        isActive: true,
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

  const getSizeLabel = (s: string) => {
    switch (s) {
      case "slim":
        return "Patla (Slim Strip)"
      case "medium":
        return "Medium (16:9)"
      case "full":
        return "Bada (Full Screen)"
      default:
        return "Chhota (Auto / Natural)"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Promotional &amp; Brand Banners</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dynamic homepage banners with full control over dimensions (Chhota, Patla, Bada, Medium), video playback, and positioning.
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

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No banners found</p>
          </div>
        ) : (
          banners.map((b) => {
            const isVid = b.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(b.videoUrl || b.imageUrl || "")
            const mediaSource = isVid ? (b.videoUrl || b.imageUrl) : b.imageUrl

            return (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Media Preview Box */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  {isVid ? (
                    <video
                      src={getImageUrl(mediaSource)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getImageUrl(mediaSource)}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                    <span className="bg-slate-900/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                      #{b.order || 1} • {b.position === "middle" ? "Middle" : b.position === "bottom" ? "Bottom" : "Hero"}
                    </span>
                    {isVid ? (
                      <span className="bg-purple-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </span>
                    ) : (
                      <span className="bg-amber-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Photo</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Size Badge */}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                    Size: {getSizeLabel(b.size)}
                  </span>
                </div>

                {/* Banner Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {b.tag && (
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                        {b.tag}
                      </span>
                    )}
                    <h3 className="font-serif font-bold text-slate-900 text-base">{b.title}</h3>
                    {b.subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.subtitle}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {b.link || "/products"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Dynamic Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingBanner ? "Edit Banner Configuration" : "New Dynamic Banner"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Control exact banner size, video/photo media, and placement position.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Placement Position */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1. Placement Position on Storefront *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition("hero")}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      position === "hero"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Top Hero Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition("middle")}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      position === "middle"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Middle Section
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition("bottom")}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      position === "bottom"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Bottom Section
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {position === "hero"
                    ? "Renders in the top slideshow at the very top of the homepage."
                    : position === "middle"
                    ? "Renders between the 1st batch (Hampers) and 2nd batch (Corporate) of products."
                    : "Renders between the 2nd batch and 3rd batch (Bespoke Keepsakes) of products."}
                </p>
              </div>

              {/* Banner Size Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Banner Size / Height Display *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSize("auto")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      size === "auto"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-xs">Chhota (Auto)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Natural ratio, no crop</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSize("slim")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      size === "slim"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-xs">Patla (Slim Strip)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Thin panoramic bar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSize("medium")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      size === "medium"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-xs">Medium (16:9)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Standard promo height</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSize("full")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      size === "full"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-xs">Bada (Full Screen)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Full viewport height</div>
                  </button>
                </div>
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Media Format *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      mediaType === "image"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Photo / Image Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      mediaType === "video"
                        ? "bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Video Banner (Looping MP4/WebM)</span>
                  </button>
                </div>
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scuderia Ferrari Collection"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mini Tag / Header
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Scuderia Corsa"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Official racing merchandise and handcrafted gift sets..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Media URL & Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {mediaType === "video" ? "Video File / URL (MP4 / WebM)" : "Image File / URL (JPG / WebP / PNG)"} *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={mediaType === "video" ? (videoUrl || imageUrl) : imageUrl}
                    onChange={(e) => {
                      if (mediaType === "video") {
                        setVideoUrl(e.target.value)
                        setImageUrl(e.target.value)
                      } else {
                        setImageUrl(e.target.value)
                      }
                    }}
                    placeholder={mediaType === "video" ? "https://... or /uploads/video.mp4" : "https://... or /uploads/banner.jpg"}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    {uploadingMedia ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-600" />
                    )}
                    <span>{uploadingMedia ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports JPG, PNG, WebP images and MP4, WebM videos up to 60MB.
                </p>
              </div>

              {/* Media Live Preview */}
              {(imageUrl || videoUrl) && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    Live Preview ({mediaType === "video" ? "Video Banner" : "Image Banner"} • {getSizeLabel(size)})
                  </span>
                  <div className="overflow-hidden rounded-lg max-h-48 flex items-center justify-center bg-black">
                    {mediaType === "video" ? (
                      <video
                        src={getImageUrl(videoUrl || imageUrl)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full max-h-48 object-cover"
                      />
                    ) : (
                      <img
                        src={getImageUrl(imageUrl)}
                        alt="Preview"
                        className="w-full max-h-48 object-cover"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Target Link & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Click Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/products?category=gift-hampers"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingMedia}
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
