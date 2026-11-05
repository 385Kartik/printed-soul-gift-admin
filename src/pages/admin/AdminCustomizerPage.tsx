import React, { useState, useEffect } from "react"
import {
  Palette,
  Type,
  LayoutGrid,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  Play,
  Image as ImageIcon,
  Video,
  Eye,
  Sliders,
  Maximize2,
  Undo2,
} from "lucide-react"
import { adminApi } from "../../lib/api"

const COLOR_PRESETS = [
  {
    name: "Signature Scuderia",
    bg: "#0A0204",
    primary: "#DC2626",
    surface: "#140507",
    textPrimary: "#FFFFFF",
    textMuted: "#A1A1AA",
    border: "rgba(255, 255, 255, 0.08)",
    gold: "#F59E0B",
  },
  {
    name: "Pure Onyx & Gold",
    bg: "#000000",
    primary: "#D4AF37",
    surface: "#111111",
    textPrimary: "#FFFFFF",
    textMuted: "#9CA3AF",
    border: "rgba(212, 175, 55, 0.2)",
    gold: "#D4AF37",
  },
  {
    name: "Midnight Sapphire",
    bg: "#050B14",
    primary: "#2563EB",
    surface: "#0B1526",
    textPrimary: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "rgba(37, 99, 235, 0.15)",
    gold: "#38BDF8",
  },
  {
    name: "Imperial Emerald",
    bg: "#030E07",
    primary: "#059669",
    surface: "#081C10",
    textPrimary: "#F0FDF4",
    textMuted: "#86EFAC",
    border: "rgba(5, 150, 105, 0.2)",
    gold: "#34D399",
  },
  {
    name: "Velvet Crimson",
    bg: "#0C0306",
    primary: "#E11D48",
    surface: "#18080E",
    textPrimary: "#FFF1F2",
    textMuted: "#FDA4AF",
    border: "rgba(225, 29, 72, 0.15)",
    gold: "#F43F5E",
  },
]

export const AdminCustomizerPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  // 1. Colors
  const [background, setBackground] = useState("#0A0204")
  const [primary, setPrimary] = useState("#DC2626")
  const [surface, setSurface] = useState("#140507")
  const [textPrimary, setTextPrimary] = useState("#FFFFFF")
  const [textMuted, setTextMuted] = useState("#A1A1AA")
  const [borderColor, setBorderColor] = useState("rgba(255, 255, 255, 0.08)")
  const [goldAccent, setGoldAccent] = useState("#F59E0B")

  // 2. Banners & Typography
  const [showHeadings, setShowHeadings] = useState(false)
  const [bannerFontFamily, setBannerFontFamily] = useState("Playfair Display")
  const [headingSize, setHeadingSize] = useState<"small" | "medium" | "large" | "xlarge">("large")
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center")
  const [bannerPosition, setBannerPosition] = useState<
    "center" | "bottom-left" | "bottom-center" | "bottom-right"
  >("center")
  const [bannerTextColor, setBannerTextColor] = useState("#FFFFFF")
  const [showSubtitle, setShowSubtitle] = useState(true)

  // 3. Products on Home Page
  const [aspectRatio, setAspectRatio] = useState<"4:5" | "1:1" | "3:4" | "16:9">("4:5")
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4)
  const [photoMode, setPhotoMode] = useState<"single" | "multi">("multi")
  const [hoverBehavior, setHoverBehavior] = useState<"video" | "second_image" | "zoom" | "none">(
    "video"
  )

  // Active Tab
  const [activeTab, setActiveTab] = useState<"colors" | "banners" | "products">("colors")

  useEffect(() => {
    fetchTheme()
  }, [])

  const fetchTheme = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getTheme()
      const data = res.data?.data
      if (data) {
        if (data.colors) {
          setBackground(data.colors.background || "#0A0204")
          setPrimary(data.colors.primary || "#DC2626")
          setSurface(data.colors.surface || "#140507")
          setTextPrimary(data.colors.textPrimary || "#FFFFFF")
          setTextMuted(data.colors.textMuted || "#A1A1AA")
          setBorderColor(data.colors.borderColor || "rgba(255, 255, 255, 0.08)")
          setGoldAccent(data.colors.goldAccent || "#F59E0B")
        }
        if (data.banners) {
          setShowHeadings(data.banners.showHeadings ?? false)
          setBannerFontFamily(data.banners.fontFamily || "Playfair Display")
          setHeadingSize(data.banners.headingSize || "large")
          setAlignment(data.banners.alignment || "center")
          setBannerPosition(data.banners.position || "center")
          setBannerTextColor(data.banners.textColor || "#FFFFFF")
          setShowSubtitle(data.banners.showSubtitle ?? true)
        }
        if (data.products) {
          setAspectRatio(data.products.aspectRatio || "4:5")
          setGridColumns(data.products.gridColumns || 4)
          setPhotoMode(data.products.photoMode || "multi")
          setHoverBehavior(data.products.hoverBehavior || "video")
        }
      }
    } catch (err) {
      console.error("Failed to load theme settings", err)
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    setBackground(preset.bg)
    setPrimary(preset.primary)
    setSurface(preset.surface)
    setTextPrimary(preset.textPrimary)
    setTextMuted(preset.textMuted)
    setBorderColor(preset.border)
    setGoldAccent(preset.gold)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        colors: {
          background,
          primary,
          surface,
          textPrimary,
          textMuted,
          borderColor,
          goldAccent,
        },
        banners: {
          showHeadings,
          fontFamily: bannerFontFamily,
          headingSize,
          alignment,
          position: bannerPosition,
          textColor: bannerTextColor,
          showSubtitle,
          showButton: true,
        },
        products: {
          aspectRatio,
          gridColumns,
          photoMode,
          hoverBehavior,
          cardRadius: "rounded-xl",
          showPrice: true,
          showRating: true,
        },
      }

      await adminApi.updateTheme(payload)
      setMsg("Storefront appearance saved successfully! Changes are live across the store.")
      setTimeout(() => setMsg(""), 4500)
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save theme settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-600" />
            <span>Storefront Customizer &amp; Appearance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure site colors, banner headings typography, product photo dimensions, and hover video effects.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Changes..." : "Save Customization"}</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === "colors"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors &amp; Theme</span>
        </button>

        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === "banners"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Banner Headings &amp; Font</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === "products"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Product Photos &amp; Hover</span>
        </button>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: COLORS */}
          {activeTab === "colors" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Curated Luxury Color Schemes</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click a preset to quickly apply a coordinated color scheme across the store.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: p.bg }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: p.gold }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-600">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Custom Color Palette</h3>

                {/* Background Color */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Website Background Color
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Canvas color behind banners, headers and products
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                    />
                  </div>
                </div>

                {/* Primary Accent Color */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Brand Primary Accent Color
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Buttons, active sliders, highlights and badges
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primary}
                      onChange={(e) => setPrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={primary}
                      onChange={(e) => setPrimary(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                    />
                  </div>
                </div>

                {/* Surface / Card Background */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Card &amp; Surface Background
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Background for product photo placeholders and elevated cards
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                    />
                  </div>
                </div>

                {/* Text Primary Color */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Main Text &amp; Title Color
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Product names, headings, and primary typography
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textPrimary}
                      onChange={(e) => setTextPrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={textPrimary}
                      onChange={(e) => setTextPrimary(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                    />
                  </div>
                </div>

                {/* Text Muted Color */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Secondary &amp; Muted Text Color
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Subtitles, prices compare, and category breadcrumbs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textMuted}
                      onChange={(e) => setTextMuted(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={textMuted}
                      onChange={(e) => setTextMuted(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BANNERS & TYPOGRAPHY */}
          {activeTab === "banners" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Banner Headings &amp; Text Overlays</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Choose whether headings appear on top of banners, which font to use, size, and alignment.
                </p>
              </div>

              {/* Show Headings Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Display Headings on Banners
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When OFF, banners show pure visual media without text overlays.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHeadings(!showHeadings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showHeadings ? "bg-amber-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showHeadings ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {showHeadings && (
                <div className="space-y-4 pt-2">
                  {/* Font Family */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Banner Heading Font Family
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "Playfair Display", name: "Playfair Display (Serif)" },
                        { id: "Cinzel", name: "Cinzel (Roman)" },
                        { id: "Cormorant Garamond", name: "Cormorant (Haute)" },
                        { id: "Montserrat", name: "Montserrat (Modern Sans)" },
                        { id: "Inter", name: "Inter (Clean Sans)" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setBannerFontFamily(f.id)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                            bannerFontFamily === f.id
                              ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heading Size */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Heading Font Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "small", label: "Small (24px)" },
                        { id: "medium", label: "Medium (36px)" },
                        { id: "large", label: "Large (48px)" },
                        { id: "xlarge", label: "Extra Large (64px)" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setHeadingSize(s.id as any)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            headingSize === s.id
                              ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Text Alignment (Left / Center / Right)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "left", label: "Left Aligned" },
                        { id: "center", label: "Center Aligned" },
                        { id: "right", label: "Right Aligned" },
                      ].map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setAlignment(a.id as any)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            alignment === a.id
                              ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay Position */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Overlay Position on Banner
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "center", label: "Center Screen" },
                        { id: "bottom-left", label: "Bottom Left" },
                        { id: "bottom-center", label: "Bottom Center" },
                        { id: "bottom-right", label: "Bottom Right" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setBannerPosition(p.id as any)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            bannerPosition === p.id
                              ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heading Text Color */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Heading Text Color
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Color of the title and subtitle overlay
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS & HOVER */}
          {activeTab === "products" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Card Photos &amp; Layout</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configure photo dimensions on homepage, 1 photo vs multi-photo gallery, and on-hover video playback.
                </p>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Product Image Aspect Ratio (Home Page Size)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "4:5", name: "4:5 Luxury Portrait", desc: "Tall vertical (Standard)" },
                    { id: "1:1", name: "1:1 Square", desc: "Clean modern box" },
                    { id: "3:4", name: "3:4 Editorial", desc: "Classic catalog ratio" },
                    { id: "16:9", name: "16:9 Landscape", desc: "Wide display" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAspectRatio(r.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        aspectRatio === r.id
                          ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{r.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Columns */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Home Page Desktop Columns (Products per Row)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 4, name: "4 Products / Row", desc: "Compact luxury standard" },
                    { id: 3, name: "3 Products / Row", desc: "Larger prominent photos" },
                    { id: 2, name: "2 Products / Row", desc: "Extra large feature cards" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setGridColumns(c.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        gridColumns === c.id
                          ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{c.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Product Photos Display Count (1 Photo vs Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPhotoMode("single")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      photoMode === "single"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-semibold block flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>Single Primary Photo</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Always shows only 1 hero photo per product.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoMode("multi")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      photoMode === "multi"
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-semibold block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Multi-Photo Showcase</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Enables multiple image dots &amp; interactive gallery on card.
                    </span>
                  </button>
                </div>
              </div>

              {/* Hover Behavior */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  On-Hover Action (Video Clip vs Photo Flip)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: "video",
                      label: "Play Video Clip",
                      desc: "Autoplays looping video on hover",
                    },
                    {
                      id: "second_image",
                      label: "Show 2nd Photo",
                      desc: "Flips smoothly to next photo",
                    },
                    {
                      id: "zoom",
                      label: "Smooth Zoom",
                      desc: "Gently scales the primary photo",
                    },
                    {
                      id: "none",
                      label: "Static (None)",
                      desc: "No movement on hover",
                    },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHoverBehavior(h.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        hoverBehavior === h.id
                          ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{h.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{h.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Interactive Simulation Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Live Storefront Simulation</span>
              </span>
              <span className="text-[10px] text-slate-400">Updates live as you adjust</span>
            </div>

            {/* Simulated Canvas */}
            <div
              className="rounded-2xl border p-4 sm:p-5 space-y-5 overflow-hidden shadow-xl transition-all"
              style={{
                backgroundColor: background,
                borderColor: borderColor,
                color: textPrimary,
              }}
            >
              {/* Simulated Banner */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 group">
                <img
                  src="/hero-ferrari-hamper.jpg"
                  alt="Simulated Banner"
                  className="w-full h-full object-cover"
                />

                {showHeadings && (
                  <div
                    className={`absolute inset-0 bg-black/40 flex flex-col p-3 transition-opacity ${
                      bannerPosition === "center"
                        ? "justify-center items-center text-center"
                        : bannerPosition === "bottom-left"
                        ? "justify-end items-start text-left"
                        : bannerPosition === "bottom-right"
                        ? "justify-end items-end text-right"
                        : "justify-end items-center text-center"
                    }`}
                    style={{ textAlign: alignment }}
                  >
                    <span
                      className="font-bold leading-tight drop-shadow-md"
                      style={{
                        color: bannerTextColor,
                        fontFamily: bannerFontFamily,
                        fontSize:
                          headingSize === "small"
                            ? "14px"
                            : headingSize === "medium"
                            ? "18px"
                            : headingSize === "large"
                            ? "22px"
                            : "26px",
                      }}
                    >
                      Ferrari Gifting Collection
                    </span>
                    {showSubtitle && (
                      <span
                        className="text-[10px] mt-1 opacity-80"
                        style={{ color: textMuted }}
                      >
                        Handcrafted luxury hampers &amp; executive suites
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Simulated Product Card */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: primary }}
                  >
                    Simulated Product Grid ({gridColumns} Cols • {aspectRatio})
                  </span>
                  <span className="text-[9px]" style={{ color: textMuted }}>
                    Hover to test: {hoverBehavior}
                  </span>
                </div>

                <div className="w-full max-w-[240px] mx-auto">
                  <div
                    className={`relative w-full rounded-xl overflow-hidden group cursor-pointer border border-white/5 transition-all ${
                      aspectRatio === "1:1"
                        ? "aspect-square"
                        : aspectRatio === "3:4"
                        ? "aspect-[3/4]"
                        : aspectRatio === "16:9"
                        ? "aspect-video"
                        : "aspect-[4/5]"
                    }`}
                    style={{ backgroundColor: surface }}
                  >
                    {/* Simulated Primary Image */}
                    <img
                      src="/product-executive-tumbler.jpg"
                      alt="Product"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        hoverBehavior === "zoom"
                          ? "group-hover:scale-110"
                          : hoverBehavior === "second_image"
                          ? "group-hover:opacity-0"
                          : ""
                      }`}
                    />

                    {/* Simulated 2nd Image on Hover */}
                    {hoverBehavior === "second_image" && (
                      <img
                        src="/product-leather-wallet.jpg"
                        alt="2nd"
                        className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}

                    {/* Simulated Hover Video indicator */}
                    {hoverBehavior === "video" && (
                      <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" />
                        <span>Hover Video</span>
                      </div>
                    )}

                    {/* Multi-Photo Dots */}
                    {photoMode === "multi" && (
                      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
                        <span className="w-3 h-1 rounded-full bg-white shadow-xs" />
                        <span className="w-1.5 h-1 rounded-full bg-white/40" />
                        <span className="w-1.5 h-1 rounded-full bg-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="mt-2.5 space-y-1">
                    <span
                      className="text-xs font-serif font-bold block truncate"
                      style={{ color: textPrimary }}
                    >
                      Executive Insulated Tumbler
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: primary }}>
                        ₹2,499
                      </span>
                      <span className="text-[10px] line-through" style={{ color: textMuted }}>
                        ₹3,499
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: primary }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save All Changes to Live Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
