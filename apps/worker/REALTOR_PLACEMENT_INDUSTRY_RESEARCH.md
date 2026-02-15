# How Others Place Realtors in Property Tours — Industry Research (Feb 2026)

**Question**: How do real estate AI tools make the realtor look naturally part of the scene vs. composited "added"?

---

## 1. Industry Standard: Picture-in-Picture (PiP) / Overlay

**Most real estate AI tools do NOT put the realtor inside the room.** They use:

| Approach | How it works | Who uses it |
|----------|--------------|-------------|
| **Talking head overlay** | Avatar in a corner/window; property footage full-screen | Synthesia, HeyGen, Akool, Miraflow |
| **Green screen composite** | Avatar filmed on green screen, keyed over property background | Studio avatars; requires physical shoot |
| **Chroma key / Alpha** | Person extracted from background, placed over property | AI video platforms |

**Why PiP dominates**:
- Avoids "person walking through furniture" — avatar never enters the scene
- Avatar "guides" the tour by talking; property footage plays separately
- Lip-sync, gestures, expressions work well in isolation
- Production: generate avatar clip + property video; composite in NLE
- **No depth, no occlusion, no spatial consistency required**

**Akool, Synthesia, HeyGen** marketing says "avatar moves through the property" — but technically they mean:
- Avatar appears in a window/corner that transitions/cuts as the tour progresses, OR
- Avatar is composited over property (layer on top), not physically IN the room
- The avatar does not walk through doors or between furniture in 3D space

---

## 2. In-Scene Placement (What We're Doing)

Putting the realtor **inside** the room photo, then animating with Kling:

| Component | Our stack | Limitation |
|-----------|-----------|------------|
| **Composite** | Nano Banana Pro (avatar + room photo) | Prompt-only; no depth, no mask, no placement coords |
| **Animate** | Kling 3.0 (start + end frame interpolation) | No 3D awareness; interpolates pixels, can clip through objects |

**Result**: Realtor can look pasted, walk through furniture, float — because neither Nano nor Kling has spatial/geometric understanding.

---

## 3. Research Frontiers (Not Yet Commercial APIs)

Academic work in 2025 addresses in-scene placement with physics:

| Method | Approach | Key idea | Commercial? |
|--------|----------|----------|-------------|
| **InsertAnywhere** | 4D scene geometry + diffusion | Reconstruct depth, propagate placement, handle occlusion | No — research paper |
| **VideoAnydoor** | Keypoint trajectories + pixel warper | Reference video for motion; precise control | No — GitHub, research |
| **Populate-a-Scene** | Affordance-aware generation | Model infers "where can a person stand" from scene | No — research |
| **Person-In-Situ** | Depth maps or implicit occlusion | 3D body model + latent diffusion for placement | No — research |

**Common themes**:
- **Depth maps** — know where floor, walls, furniture are
- **Affordance** — infer "walkable" vs "occupied" from scene
- **Occlusion** — person goes behind/around objects correctly
- **4D geometry** — temporal consistency across frames

None of these are exposed as commercial APIs (Kie, Runway, Pika, Fal) as of Feb 2026.

---

## 4. Commercial Video APIs (Kling, Runway, Pika)

- **Kling**: Best for character consistency, natural motion; no depth-aware insertion
- **Runway Gen-4**: Strong lighting, composition; multi-scene transitions weak
- **Pika 2.1**: Fast, viral content; morphing on complex subjects

**None offer**:
- Depth-aware person insertion
- Affordance-based placement
- Explicit "person walks around furniture" control

---

## 5. Implication for TourReel

| Option | Pros | Cons |
|--------|------|------|
| **A. PiP / overlay** | Industry standard, no spatial bugs | Realtor not "in" the house; different look |
| **B. Keep in-scene + prompt hacks** | Realtor in room; matches our vision | Clipping/furniture issues; prompt-only fixes are limited |
| **C. Wait for research→API** | Depth/affordance when available | Timeline unclear; InsertAnywhere, VideoAnydoor not commercial |
| **D. Build depth pipeline** | Could use MiDaS/depth model + custom logic | Significant R&D; not guaranteed to plug into Kling |

**Recommendation**: Short-term, Option B (prompt improvements we added) + consider Option A as fallback ("classic" PiP mode) if users prefer reliability over in-scene realism. Long-term, monitor Kie/Runway/Fal for depth-aware or affordance-based APIs.

---

## 6. References

- Akool: Personalized Property Tour Videos with AI Avatars
- Argil: Top AI Avatar Tools for Real Estate 2026
- Reelmind: AI in Real Estate Videos
- Upuply: Video ki Video — PiP, compositing
- arXiv: InsertAnywhere (2512.17504), VideoAnydoor (2501.01427), Populate-a-Scene
- Mobillog: Runway vs Pika vs Kling 2025
