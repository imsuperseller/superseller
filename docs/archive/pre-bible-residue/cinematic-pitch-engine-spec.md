# Cinematic Ego-Pitch Engine Specification

## 1. Core Concept
**"Templated Cinematic Ego-Pitch Engine"**
A system that auto-generates short, funny, hyper-personalized videos where the prospect is the hero and the business is the sidekick/servant.

### Input Layer
*   **Prospect Data:** Name, role, company, website, socials, niche, pain points.
*   **Business Data:** Offer, pricing, case studies, automations, visual identity.
*   **Context:** Source (form, WhatsApp, LinkedIn, etc.).

### The Engine (AI Logic)
1.  **Classify Archetype:** (e.g., Restaurant Owner, Realtor, SaaS Founder).
2.  **Pick Template:** (Shark Tank, God/Temple, Game Show, Movie Trailer).
3.  **Map Script:** "We know you're X... you want Y... here's what happens if you give us a shot..."
4.  **Generate:**
    *   Script (Voice + Text)
    *   Scene List / Storyboard (Sora prompt)
    *   Visual Jokes

### Output
*   15–30 sec video draft.
*   Fully generated (Sora) or Storyboard + Avatar (HeyGen).
*   Delivered via WhatsApp, Email, LinkedIn, or Landing Page.

---

## 2. Use-Case Families

### Family 1: "God-tier Prospect"
*   **Concept:** Prospect is Emperor, we are the temple/servants.
*   **Use Case 2.1: Cold Outbound**
    *   *Template:* "Temple of [Name]"
    *   *Scene:* Marble temple with prospect's logo.
    *   *Voiceover:* "Welcome to the Temple of [Name]..."
*   **Use Case 2.2: Follow-up**
    *   *Template:* "Divine Recap"
    *   *Scene:* Heavenly command center.
    *   *Content:* Before/After automation comparison.

### Family 2: "Shark Tank" Investor Pitch
*   **Concept:** Prospect is the Shark, we are the founder.
*   **Use Case 3.1: Prospect as Shark**
    *   *Template:* "You are the Shark"
    *   *Scene:* Dark studio, spotlight on empty chair with logo.
    *   *Content:* Unit economics pitch.
*   **Use Case 3.2: Portfolio Upgrade**
    *   *Template:* "Second Deal"
    *   *Content:* Upsell/Cross-sell for existing clients.

### Family 3: "Game Show"
*   **Concept:** Prospect is genius contestant, automation is cheat code.
*   **Use Case 4.1: Quiz**
    *   *Template:* "Game Show of [Name]"
    *   *Scene:* Game show stage.
    *   *Content:* "How many hours could you save?"

### Family 4: "Movie Trailer"
*   **Concept:** Cinematic "Before/After" trailer.
*   **Use Case 5.1: Trailer of Future Business**
    *   *Template:* "Automation Cut"
    *   *Scene:* Act 1 Chaos -> Act 2 Automation Order.

### Family 5: "Onboarding & Success"
*   **Concept:** Celebration of the new "Supreme Client".
*   **Use Case 6.1: Welcome**
    *   *Template:* "Coronation Ceremony"
    *   *Scene:* Throne room.
*   **Use Case 6.2: Milestone**
    *   *Template:* "Anniversary Parade"
    *   *Scene:* Robot parade with stats.

### Family 6: "Agency Pitch (Dogfooding)"
*   **Concept:** Use the engine to pitch Rensto itself.
*   **Flow:**
    1.  Lead fills Typeform/WhatsApp.
    2.  n8n/Make enriches data & crafts script.
    3.  Video generated & sent in minutes.

---

## 3. Implementation Roadmap (Proposed)
1.  **Define Minimal Prompt Schema:** Exact fields needed.
2.  **Map to Templates:** Concrete Sora/HeyGen templates.
3.  **Vertical Prototype:** Pick one vertical (e.g., Restaurants) and script end-to-end.
