---
description: Performance invariants and Core Web Vitals best practices for Next.js web applications
globs: ["**/*.tsx", "**/*.ts", "package.json", "tsconfig.json", "next.config.ts"]
---

# Core Web Vitals & Chrome Performance Invariants

When developing, optimizing, or auditing Next.js applications for PageSpeed Insights, Lighthouse, and Chrome DevTools Performance Insights, strictly adhere to the following invariants:

## 1. Modern Browser Target & Polyfill Elimination
- Target modern Baseline browsers in `package.json`:
  ```json
  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions",
    "not dead"
  ]
  ```
- Target `"ES2022"` or higher in `tsconfig.json` compiler options.
- When Baseline polyfills (e.g. `Array.prototype.at`, `flat`, `flatMap`, `Object.hasOwn`, `Object.fromEntries`, `String.prototype.trimStart/End`) are flagged in modern chunks, replace `@next/polyfill-module` via Webpack's `NormalModuleReplacementPlugin` with an empty stub to eliminate redundant polyfill payload.
- Avoid unnecessary `transpilePackages` for packages already emitting modern ES modules.

## 2. LCP Discovery & Bit-for-Bit Preload Alignment
- The above-the-fold hero / LCP image MUST have `fetchPriority="high"` on the `<img>` element and `loading="eager"` (or `priority={true}` in Next.js).
- Any `<link rel="preload">` in `<head>` MUST match the exact requested image URL, format, and `fetchPriority="high"` bit-for-bit to prevent duplicate downloads and Chrome `lcp-discovery` warnings.
- Avoid eager-prefetching offscreen/secondary assets in mount effects that compete for initial network bandwidth with the LCP image.

## 3. Forced Reflow Elimination Above the Fold
- Never query DOM geometry synchronously (`getBoundingClientRect()`, `offsetWidth`, `offsetHeight`, `scrollTop`) during component mount or initial render.
- Avoid Framer Motion / heavy animation libraries on initial above-the-fold viewport elements. Use hardware-accelerated CSS transitions, CSS keyframe animations, and compositor-only properties (`opacity`, `transform`).
- Scroll-driven effects or parallax MUST use passive listeners (`requestAnimationFrame`) or arithmetic scroll progress bounds without synchronous layout recalculation.

## 4. Unused JavaScript Reduction & Root Provider Pruning
- Heavy interactive drawers, audio controllers, and modals (e.g., Cart Drawer, Auth Modal, Lightbox) MUST be dynamically loaded via `next/dynamic(() => import(...), { ssr: false })` or loaded on user intent.
- Below-the-fold page sections MUST be code-split and loaded via `next/dynamic`.
- Keep the critical root bundle minimal to maximize TBT (Total Blocking Time) and FCP (First Contentful Paint).

## 5. Main-Thread Idle Hydration
- Defer non-critical client initializations (such as auth session retrieval, telemetry trackers, and background listeners) using `requestIdleCallback` (with a `setTimeout` fallback) to keep the main thread idle during initial paint and hydration.

## 6. Render-Blocking Font & CSS Delivery
- Configure Google Fonts via `next/font/google` with `display: 'swap'` and strictly prune unneeded weights and styles.
- Prefer self-hosted font assets to eliminate third-party CDN network roundtrips.
