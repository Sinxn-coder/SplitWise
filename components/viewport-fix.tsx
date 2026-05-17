"use client"

import { useEffect } from "react"

/**
 * ViewportFix — Cross-platform (iOS Safari + Android Chrome)
 * ──────────────────────────────────────────────────────────────────────────────
 * Problem: Both iOS Safari and Android Chrome auto-zoom the page when a user
 * taps an input with font-size < 16px. After typing ends and the keyboard
 * closes, the page often stays zoomed in / scrolled down.
 *
 * Solution:
 *  1. CSS in globals.css sets font-size: 16px on all inputs (prevents the
 *     zoom from triggering in the first place).
 *  2. This component handles two additional cases:
 *     a) Locks viewport scale to 1 on focus (belt & suspenders for iOS)
 *     b) Uses the VisualViewport API to detect keyboard close on BOTH
 *        iOS Safari and Android Chrome, then snaps the page back to 1:1 scale.
 *
 * VisualViewport API:
 *   - Supported: iOS Safari 13+, Android Chrome 61+
 *   - When keyboard opens  → visualViewport.height shrinks
 *   - When keyboard closes → visualViewport.height returns to full size
 * ──────────────────────────────────────────────────────────────────────────────
 */
export function ViewportFix() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Only run on actual mobile devices — skip desktop browsers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const viewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]'
    )
    if (!viewportMeta) return

    // Save original viewport content so we can restore it precisely
    const originalContent = viewportMeta.content

    // Track whether a keyboard-aware input is currently focused
    let inputFocused = false

    // ── 1. Lock scale on focus (iOS + Android) ────────────────────────────────
    const onFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || tag === "select") {
        inputFocused = true
        // Lock maximum-scale so neither iOS nor Android can zoom the page
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        )
      }
    }

    // ── 2a. Restore scale on blur (iOS Safari – keyboard dismiss) ─────────────
    const onFocusOut = () => {
      inputFocused = false
      // Delay so keyboard close animation finishes before we reset
      setTimeout(() => {
        if (!inputFocused) {
          viewportMeta.setAttribute("content", originalContent)
          // Snap back to top — prevents iOS staying scrolled into keyboard area
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }, 200)
    }

    // ── 2b. VisualViewport resize (Android Chrome + iOS 13+) ─────────────────
    // Android Chrome doesn't reliably fire focusout when keyboard closes via
    // the system back button or swipe. VisualViewport.resize is the correct
    // cross-platform signal that the keyboard has appeared or disappeared.
    let lastVVHeight = window.visualViewport?.height ?? window.innerHeight
    
    const onVisualViewportResize = () => {
      const vv = window.visualViewport
      if (!vv) return

      const currentHeight = vv.height
      const keyboardJustClosed = currentHeight > lastVVHeight

      lastVVHeight = currentHeight

      if (keyboardJustClosed && !inputFocused) {
        // Keyboard closed (height grew back) and no input is focused —
        // restore viewport and scroll to origin
        setTimeout(() => {
          viewportMeta.setAttribute("content", originalContent)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }, 100)
      }
    }

    // ── Attach all listeners ──────────────────────────────────────────────────
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener("resize", onVisualViewportResize)
    }

    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      vv?.removeEventListener("resize", onVisualViewportResize)
    }
  }, [])

  return null
}
