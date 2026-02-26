# Video Create Page — Hydration Error Research

## The Error

```
Hydration failed because the server rendered text didn't match the client.
Server: {" "}
Client: {"Paste Zillow URL and optionally add floorplan & realtor photo"}
Component: ClientOnlySubtitle at page.tsx
```

## Root Cause

The server sent a single space; the client sent the full subtitle. React expects **identical** output for the initial client render as what the server sent. Any difference triggers this error.

## What Causes This (Canonical List)

1. **`typeof window !== 'undefined'`** — Server has no `window`, client does. Different branches = mismatch.
2. **`Date.now()`, `Math.random()`** — Values differ between server and client runs.
3. **`Date`/locale formatting** — Server locale may differ from client.
4. **Mounted / client-only gates used incorrectly** — If server renders A and client's *first* render (before `useEffect`) is B, you get a mismatch.
5. **Invalid HTML nesting** — e.g. `<p>` inside `<p>`.
6. **Browser extensions** — Grammarly, etc. can inject DOM before React hydrates.
7. **CDN/Edge modifying HTML** — e.g. Cloudflare Auto Minify.

## What We Tried (and Why It Failed)

### ❌ ClientOnlySubtitle / mounted gate for static text

**Attempt:** Hide "real" text on server, show placeholder (space), then show real text after `useEffect` on client.

**Why it failed:** For this to avoid a mismatch, server and *initial* client render must be identical. If the implementation rendered:
- Server: ` ` (space)
- Client first paint: full text

then the client was not using the same placeholder as the server (e.g. different branch, different initial state, or stale/cached client bundle). The "client-only" pattern only works when *both* server and initial client render the placeholder.

### ❌ `suppressHydrationWarning` on the mismatch

**Attempt:** Silence the warning on the element.

**Why it fails:** Per React docs, `suppressHydrationWarning` does not fix the mismatch. React will *not* patch the mismatched content; it only suppresses the warning. The underlying inconsistency remains and can cause layout/behavior issues.

### ❌ `dynamic(..., { ssr: false })` in a Server Component

**Attempt:** Skip SSR for the form to avoid hydration.

**Why it failed:** Next.js disallows `ssr: false` in Server Components. Error: `"ssr: false" is not allowed with next/dynamic in Server Components`.

### ❌ Deferring Toaster, GTM, WhatsApp until mounted

**Attempt:** Render those components only after `useEffect` so they don't affect the first paint.

**Why it helped only partly:** If the *placeholder* (e.g. `null` or empty) is the same on server and client, this can work. But if any of those components still render something different on server vs client, or if children are affected, the mismatch persists.

### ✅ Isolating /video from the heavy layout

**What worked:** For `/video/*`, use a minimal shell (no GTM, Toaster, WhatsApp, Schema, RouteAwareLayout). The server decides via `x-pathname` header; no client-side branching. Server and client see the same minimal tree for video routes.

## Correct Fix for Static Text (Like the Subtitle)

**Do not** use ClientOnly, mounted gates, or placeholders for static text.

**Do** render the same string on server and client:

```tsx
<p className="text-sm text-slate-400">Paste Zillow URL and optionally add floorplan & realtor photo</p>
```

No `ClientOnlySubtitle`, no `mounted` check. Static content should be identical on both sides.

## When a Mounted Gate *Is* Valid

The pattern is valid **only if** server and initial client render the same thing:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
return mounted ? <ClientOnlyContent /> : <Placeholder />;  // Placeholder must match on BOTH
```

Both server and first client render must output `<Placeholder />`. After `useEffect`, the client switches to `<ClientOnlyContent />`.

## If You Still See ClientOnlySubtitle in the Error

The current `page.tsx` in this repo does not use `ClientOnlySubtitle`. If the error stack references it:

1. **Search for it** — `grep -r ClientOnlySubtitle src/`
2. **Remove it** — Replace with a plain `<p>` that renders the same text on server and client. No wrapper, no mounted gate.
3. **Clear build** — `rm -rf .next` and restart dev server. Stale client bundles can keep old components in play.

## Reference

- [Next.js: Text content does not match server-rendered HTML](https://nextjs.org/docs/messages/react-hydration-error)
- [React: Hydration mismatch](https://react.dev/link/hydration-mismatch)
