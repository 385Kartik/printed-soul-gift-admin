import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
    return imagePath
  }
  const apiBase = import.meta.env.VITE_API_URL || ""
  return `${apiBase}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getZoneTransformStyle(zone?: {
  rotation?: number
  rotateX?: number
  rotateY?: number
  skewX?: number
  skewY?: number
}): string {
  if (!zone) return "translate(-50%, -50%)"
  const rotZ = zone.rotation || 0
  const rotX = zone.rotateX || 0
  const rotY = zone.rotateY || 0
  const skX = zone.skewX || 0
  const skY = zone.skewY || 0

  const has3D = rotX !== 0 || rotY !== 0
  const hasSkew = skX !== 0 || skY !== 0

  if (!has3D && !hasSkew) {
    return `translate(-50%, -50%) rotate(${rotZ}deg)`
  }

  const perspectivePart = has3D ? "perspective(600px) " : ""
  const rotPart = `rotate(${rotZ}deg)`
  const tiltPart = has3D ? ` rotateX(${rotX}deg) rotateY(${rotY}deg)` : ""
  const skewPart = hasSkew ? ` skewX(${skX}deg) skewY(${skY}deg)` : ""

  return `translate(-50%, -50%) ${perspectivePart}${rotPart}${tiltPart}${skewPart}`.trim()
}

