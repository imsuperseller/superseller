---
phase: hair-approach-demo-package
plan: 05
title: Integrate video hero and mockups into /lp/hair-approach
wave: 3
depends_on: [03, 04]
files_modified:
  - apps/web/superseller-site/src/app/lp/[slug]/LandingPageClient.tsx
  - apps/web/superseller-site/prisma/seed scripts or API call to update landing_pages record
autonomous: false
must_haves:
  - /lp/hair-approach hero section plays showreel video as background
  - Video has object-cover fit, no letterboxing at 1440px
  - Poster frame (first upscaled photo) shows while video loads
  - HeroSlideshow remains as fallback if video fails to load
  - Social mockup images appear in a gallery section on the page
  - Browser verification at 1440px viewport width before declaring done
  - Cache-busted URL verification after deploy
---

<tasks>
<task id="1">
<title>Add video hero support to LandingPageClient</title>
<instructions>
Edit `apps/web/superseller-site/src/app/lp/[slug]/LandingPageClient.tsx`:

The hero section currently uses a dark gradient or HeroSlideshow. Add video hero support.

1. **Find the hero section** in the component (look for the first `<section>` or hero-related div, likely has the gradient background or HeroSlideshow).

2. **Add video hero logic.** The landing page data comes from the `LandingPage` Prisma model. Check if there's a field for `heroVideoUrl` or similar. If not, we'll use a hardcoded check for the hair-approach slug.

   Add this logic at the top of the hero section render:

   ```tsx
   // Video hero — check for video URL in landing page data or hardcode for demo
   const heroVideoUrl = (page as any).heroVideoUrl ||
       (page.slug === 'hair-approach'
           ? 'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/showreel/master-16x9.mp4'
           : null);

   const heroPosterUrl = (page as any).heroPosterUrl ||
       (page.slug === 'hair-approach'
           ? 'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg'
           : null);
   ```

3. **Render video background** in the hero section. Replace or augment the existing gradient/slideshow:

   ```tsx
   {heroVideoUrl ? (
       <div className="absolute inset-0 overflow-hidden">
           <video
               autoPlay
               muted
               loop
               playsInline
               poster={heroPosterUrl || undefined}
               className="absolute inset-0 w-full h-full object-cover"
               style={{ filter: 'brightness(0.6)' }}
           >
               <source src={heroVideoUrl} type="video/mp4" />
           </video>
           {/* Dark overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
       </div>
   ) : (
       /* existing gradient/slideshow code stays as fallback */
   )}
   ```

   Key attributes:
   - `autoPlay muted loop playsInline` — required for autoplay in all browsers
   - `poster` — shows first upscaled photo while video loads
   - `object-cover` — fills container without letterboxing
   - `brightness(0.6)` — dims video so overlaid text remains readable
   - Gradient overlay — additional readability insurance

4. **Keep existing HeroSlideshow as fallback** — don't remove it, wrap in the else branch.

5. **Video error handling**: Add onError fallback:
   ```tsx
   <video
       ...
       onError={(e) => {
           // Hide video, show fallback
           (e.target as HTMLVideoElement).style.display = 'none';
       }}
   >
   ```
</instructions>
<verify>
- TypeScript compiles: `cd apps/web/superseller-site && npm run build`
- No runtime errors on /lp/hair-approach
- Video autoplays as hero background
</verify>
<commit_message>feat: add video hero support to LandingPageClient with poster fallback</commit_message>
</task>

<task id="2">
<title>Add social mockup gallery section</title>
<instructions>
Edit `apps/web/superseller-site/src/app/lp/[slug]/LandingPageClient.tsx`:

Add a new section AFTER the existing gallery/portfolio section (or after services section if no gallery exists).

For the hair-approach slug specifically, add a "What Your Social Media Could Look Like" section:

```tsx
{page.slug === 'hair-approach' && (
    <section className="py-20 px-4" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto">
            <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center mb-4"
                style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#C9A96E',
                }}
            >
                What Your Social Media Could Look Like
            </motion.h2>
            <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center text-gray-400 mb-12 text-lg"
            >
                AI-crafted content that books appointments — zero effort from you
            </motion.p>
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {[
                    'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/mockups/mockup-1.png',
                    'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/mockups/mockup-2.png',
                    'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/mockups/mockup-3.png',
                ].map((url, i) => (
                    <motion.div key={i} variants={scaleIn}>
                        <img
                            src={url}
                            alt={`Social media mockup ${i + 1}`}
                            className="w-full rounded-lg shadow-2xl"
                            loading="lazy"
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
)}
```

This uses the existing `fadeUp`, `staggerContainer`, and `scaleIn` animation variants already defined in LandingPageClient.tsx.

Add a `<link>` tag for Playfair Display in the head or use Next.js font import. Since LandingPageClient is a client component, add at the top:
```tsx
// Add after existing imports
import { Playfair_Display } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });
```
Then use `playfair.className` instead of inline fontFamily, OR keep the inline style since it's just one section.

Actually, check if the page already loads Playfair Display (the brand font). If the landing page's brand config specifies it, it may already be loaded. If not, the inline `fontFamily: "'Playfair Display', serif"` with a Google Fonts `<link>` in the page head will work.
</instructions>
<verify>
- Section renders below the portfolio gallery on /lp/hair-approach
- 3 mockup images load and display in a responsive grid
- Animations trigger on scroll (fade up + scale in)
- Text uses Playfair Display or falls back gracefully
</verify>
<commit_message>feat: add social mockup gallery section to hair-approach landing page</commit_message>
</task>

<task id="3">
<title>Deploy and verify at 1440px</title>
<instructions>
1. **Build and deploy:**
   ```bash
   cd apps/web/superseller-site
   npm run build
   ```
   If build succeeds, push to trigger Vercel deploy:
   ```bash
   git add -A
   git commit -m "feat: Hair Approach demo package — video hero + social mockups"
   git push origin main
   ```

2. **Wait for Vercel deploy** — check `https://superseller.agency/lp/hair-approach` after deploy completes.

3. **Browser verification at 1440px** (MANDATORY — from quality gates):
   - Open Chrome DevTools
   - Set viewport to 1440px width
   - Verify:
     a. Video hero plays automatically (no black bars, no letterboxing)
     b. Video fills hero section with object-cover
     c. Poster image shows before video loads
     d. Text overlaid on video is readable
     e. Social mockup section appears below portfolio
     f. All 3 mockup images load correctly
     g. No horizontal scroll
     h. No console errors

4. **Cache-busted verification:**
   - Add `?v=1` to URL: `https://superseller.agency/lp/hair-approach?v=1`
   - Hard refresh (Cmd+Shift+R)
   - Confirm assets load fresh

5. **Mobile check** — viewport 375px width:
   - Video should still autoplay (muted+playsInline)
   - Mockup grid should stack vertically
   - No overflow issues

6. **Screenshot evidence** — take screenshots at 1440px and 375px for verification.
</instructions>
<verify>
- https://superseller.agency/lp/hair-approach loads without errors
- Video hero plays at 1440px without letterboxing
- Social mockup gallery shows 3 images
- No console errors
- Screenshots captured at 1440px and 375px
</verify>
<commit_message>chore: verify Hair Approach demo package deployment at 1440px</commit_message>
</task>
</tasks>
