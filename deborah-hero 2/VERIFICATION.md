# Verification

Production build: passed (Vite 7). Vite reports that the Next.js `use client` directive is ignored in its client-only preview; this is expected and does not prevent the build.

Chromium checks passed at 1672, 1440, 1280, 1100, 1099, 768, 390, and 320 pixels: no horizontal overflow, correct heading text, background asset loaded. On mobile widths, menu opened, closed with Escape, restored button focus, and closed after an outside click. Desktop resize closed the mobile menu. No JavaScript page errors.

Full-page desktop, mobile, and expanded-menu screenshots inspected. App navigation destinations remain integration routes supplied by the consuming application.
