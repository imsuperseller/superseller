# TourReel Realtor Consistency - Research & Implementation
**Date:** 2026-02-23
**Priority:** 🔴 CRITICAL - User's #1 quality concern

---

## Research Findings (Feb 2026)

### Kling Elements Best Practices

**Reference Image Requirements:**
- **Optimal count:** 2-4 photos from different angles ✅ [Source](https://ageofllms.com/ai-howto-prompts/ai-fun/kling-image-consistent-character)
- **Current:** We use 2 photos → **Should increase to 4**
- **Quality:** Well-lit, clear, front-facing keyframes work best
- **Style consistency:** All reference photos should have same lighting/background
- **Image matching:** Half-body reference needs half-body motion (avoid compression)

**Advanced Tagging (Elements 3.0):**
- Use `@element1`, `@element2` in prompts for precise control
- Example: `@realtor stands in kitchen gesturing toward @island`
- **We're using:** `@realtor` (basic)
- **Should use:** More explicit tagging with character definition

**Character Definition:**
- Define key features early: "professional realtor with warm smile, wearing navy blazer"
- Maintain consistency by describing same features across all clips
- **We're currently:** Generic "@realtor"
- **Should do:** Descriptive realtor definition based on avatar

---

### NEW Kling 3.0 Features (Feb 2026)

**1. Video 3.0 Omni - Subject Library** ⭐
- Create reusable character library for each realtor
- Upload 3-8 second video of character → AI extracts face, body, appearance
- **Every video uses exact same subject** - zero variation
- **Status:** 🔴 NOT IMPLEMENTED
- **Priority:** HIGH - This could solve our consistency problem
- [Source](https://a2e.ai/kling-3-0-guide-multi-scene-ai-video/)

**2. Multi-Shot Storyboarding** ⭐
- Generate multiple shots with same character in one job
- Specify duration, shot size, perspective per clip
- Maintains character coherence across all shots
- **Status:** 🔴 NOT IMPLEMENTED
- **Priority:** HIGH - Designed for our exact use case
- [Source](https://www.genaintel.com/guides/kling-3-0-kling-o3-release-features-2026)

**3. Extended Duration (15s max)**
- We're using 6-12s per clip
- Could extend finale/hero clips to 15s for better room appreciation
- [Source](https://www.prnewswire.com/news-releases/kling-ai-launches-3-0-model-ushering-in-an-era-where-everyone-can-be-a-director-302679944.html)

**4. Multiple Reference Inputs**
- Supports multiple image references + video reference simultaneously
- **Current:** 2 avatar photos
- **Should use:** 4 avatar photos + optional video reference
- [Source](https://flux-ai.io/blog/detail/Best-AI-Video-Models-2026-The-Ultimate-Guide-to-Image-to-Video-Generation-c776feaf6b2e/)

**5. Native Audio Generation**
- Multi-language, multi-character dialogue
- **Not relevant for TourReel** (we use Suno music only)

---

## Industry Benchmarks (2026)

**Character Consistency Expectations:**
- "Maintaining same character face/outfit across shots has evolved from headline feature to **baseline expectation**" [Source](https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c)
- Seedance 2.0: 9 reference images, 3 video clips support
- Veo 3.1: Up to 4 reference images per generation
- **Industry standard:** 4+ reference images for professional use

**Professional Use Cases:**
- Marketing teams create AI spokesperson deployed across hundreds of scenarios
- Same visual fidelity across different settings, messages, languages
- [Source](https://medium.com/@xuxuanzhou2015/the-state-of-ai-video-generation-in-2026-5-shifts-that-actually-matter-c0a3c9e17180)

---

## Current Implementation Gaps

| Feature | Industry Standard | Our Current | Gap |
|---------|------------------|-------------|-----|
| **Reference photos** | 4-9 images | 2 images | Need 2-4 more |
| **Subject Library** | Standard (Omni, Seedance) | Not using | 🔴 CRITICAL |
| **Multi-shot storyboard** | Standard (Kling 3.0) | Not using | 🔴 CRITICAL |
| **Character definition** | Detailed description | Generic "@realtor" | Medium |
| **Reference video** | Optional enhancement | Not using | Low priority |
| **Photo quality validation** | Automated pre-flight | None | High |

---

## Implementation Roadmap

### Phase 1: Quick Wins (Immediate)
1. **Increase reference photos to 4**
   - Require 4 avatar photos from customers (different angles)
   - Front, 3/4 left, 3/4 right, side profile
   - All same lighting, same outfit, same background

2. **Add character definition to prompts**
   - Extract realtor description from avatar analysis
   - Use Gemini 3 Flash to describe: hair color, clothing, facial features
   - Add to every clip prompt: "professional realtor named [Name] with [description]"

3. **Validate avatar quality**
   - Use Gemini 3 Flash to check: well-lit, clear face, consistent background
   - Reject poor quality avatars before generation
   - Guide customer to retake if needed

### Phase 2: Kling 3.0 Omni Upgrade (High Priority)
4. **Implement Subject Library** ⭐
   - Research Kie.ai API for Subject Library / Video 3.0 Omni access
   - Create reusable character per realtor (one-time setup)
   - Use same character across all their listings

5. **Multi-shot storyboarding** ⭐
   - Generate all 14 clips in one Omni job (not 14 separate jobs)
   - Maintains character consistency by design
   - Potentially faster + cheaper

### Phase 3: Advanced (Lower Priority)
6. **Optional video reference**
   - Allow realtor to upload 5s introduction video
   - Use as additional reference for body language, gestures

7. **Face verification between clips**
   - Use Gemini 3 Flash to compare realtor face across generated clips
   - Flag clips with different face → regenerate only those
   - Quality gate before final assembly

---

## Immediate Action (Before Next Video)

**Required Changes to `video-pipeline.worker.ts`:**

```typescript
// 1. Increase reference photo requirement
const MIN_AVATAR_PHOTOS = 4;  // Currently: expect 2, use 2
const MAX_AVATAR_PHOTOS = 6;

// 2. Validate avatar quality
const avatarQuality = await validateAvatarPhotos(avatarUrls);
if (!avatarQuality.passed) {
  throw new Error(`Avatar photos failed quality check: ${avatarQuality.issues.join(', ')}`);
}

// 3. Generate character description
const realtorDescription = await describeRealtor(avatarUrls);
// Example: "professional male realtor with short dark hair, wearing navy blazer and white shirt, warm confident smile"

// 4. Add to every prompt
const enhancedPrompt = `${realtorDescription} ${originalPrompt}`;

// 5. Use all 4-6 photos in Elements
realtorElements = [{
  name: "realtor",
  description: realtorDescription,
  element_input_urls: avatarUrls.slice(0, MAX_AVATAR_PHOTOS),  // All photos, not just 2
}];
```

**Required Changes to Customer Onboarding:**

```typescript
// apps/web/rensto-site/src/app/api/video/jobs/from-zillow/route.ts

// Validate avatar count
if (!avatarUrls || avatarUrls.length < 4) {
  return NextResponse.json(
    { error: "Please upload at least 4 professional headshot photos from different angles (front, 3/4 left, 3/4 right, side)." },
    { status: 400 }
  );
}
```

---

## Kie.ai API Research Needed

**Questions to answer:**
1. Does Kie.ai support Video 3.0 Omni model yet? (Just released Feb 2026)
2. What's the API endpoint for Subject Library feature?
3. What's the API format for multi-shot storyboarding?
4. Pricing difference between Video 3.0 vs Video 3.0 Omni?

**Check:** Kie.ai/market for model availability

---

## Success Metrics

**Quality Gate (Before Delivery):**
- [ ] Same realtor face in ALL 14 clips (manual review)
- [ ] Face similarity score > 95% between clips (automated check)
- [ ] No "different person" artifacts
- [ ] Natural gestures and expressions maintained
- [ ] Customer approval on realtor appearance

**Process Improvement:**
- [ ] 4 avatar photos collected from customer
- [ ] Avatar quality validation passed
- [ ] Character description generated
- [ ] Subject Library created (when Omni available)

---

**Next Steps:**
1. Check if Kie.ai has Video 3.0 Omni available
2. Implement 4-photo requirement + validation
3. Build character description generator
4. Test on next video (after Yaron V3 completes)

**Priority:** Fix this BEFORE next customer video.
