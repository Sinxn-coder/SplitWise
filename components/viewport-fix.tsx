"use client"

import { useEffect } from "react"

/**
 * ViewportFix
 * ──────────────────────────────────────────────────────────────────────────────
 * Two responsibilities:
 *  1. Prevent iOS Safari from zooming INTO an input on focus (CSS handles this,
 *     but we also nudge the viewport meta for extra safety).
 *  2. Snap the viewport back to its original 1:1 scale after the user finishes
 *     typing and dismisses the keyboard (focusout / blur).
 *
 * Works on iPhone/iPad Safari, Chrome iOS, and Android Chrome.
 * ──────────────────────────────────────────────────────────────────────────────
 */
export function ViewportFix() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const viewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]'
    )
    if (!viewportMeta) return

    // Store the original viewport content so we can restore it
    const originalContent = viewportMeta.content

    const preventZoom = () => {
      // Temporarily lock maximum-scale to 1 while the field is focused
      // This stops iOS from jumping into zoom mode on focus
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      )
    }

    const restoreZoom = () => {
      // Small delay so iOS finishes animating the keyboard close before we reset
      setTimeout(() => {
        // Restore original viewport - this snaps the page back to full view
        viewportMeta.setAttribute("content", originalContent)

        // Scroll back to top of the window to prevent page staying zoomed/shifted
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 150)
    }

    // Listen on the document so we catch every input/textarea/select everywhere
    document.addEventListener("focusin", preventZoom)
    document.addEventListener("focusout", restoreZoom)

    return () => {
      document.removeEventListener("focusin", preventZoom)
      document.removeEventListener("focusout", restoreZoom)
    }
  }, [])

  return null
}
