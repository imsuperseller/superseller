# E2E Tests – Video Create Flash Detection

Programmatic test suite for `/video/create` flash issues.

## What it tests

| Test | What it checks |
|------|----------------|
| **CLS** | Cumulative Layout Shift < 0.1 (no significant layout shift) |
| **Background** | Body background never white/light at 50, 200, 500, 1500ms |
| **Form** | Create form and heading visible within 3s |
| **Fine-grained** | No white flash at 0, 16, 33, 50, 83, 100, 150ms |
| **Fast 3G** | No white flash under throttled network |

## Run tests

```bash
# From apps/web/superseller-site/
npm run test:e2e                    # All e2e tests (starts dev server if needed)
npx playwright test e2e/video-create-flash.spec.ts
npm run test:e2e:headed             # Watch in headed browser
npm run test:e2e:ui                 # Playwright UI
```

Server must be reachable at `http://localhost:3002` (or set `PLAYWRIGHT_BASE_URL`).

## If a test fails

- **CLS**: Layout shifts during load → check loading states, font loading, layout wrappers
- **Light background**: White/light flash → check root layout, html/body inline styles, video layout
- **Form not visible**: Slow load or hydration → check client components, API calls

## Adding tests

Add new cases to `video-create-flash.spec.ts`. Use `getBodyBg(page)` and `isLightColor()` for background checks, and `getCLS(page, ms)` for layout stability.
