/**
 * Video Prompt Generator — Production-Ready Sora Prompts
 * Outputs structured JSON of complete, paste-ready Sora video prompts for ALL businesses.
 *
 * Run: npx tsx src/scripts/generate-video-prompts.ts
 * Pipe to file: npx tsx src/scripts/generate-video-prompts.ts > prompts.json
 */

interface VideoPrompt {
  id: string;
  business: string;
  title: string;
  soraCameoHandles: string[];
  duration: "5s" | "10s" | "20s";
  style: string;
  prompt: string;
  voiceoverText: string;
  voiceId?: string;
  music: string;
  purpose: "hero" | "ad" | "social" | "testimonial" | "reel";
}

const prompts: VideoPrompt[] = [
  // ═══════════════════════════════════════════════════
  // 1. SUPERSELLER AI (5 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "ss-hero-01",
    business: "superseller-ai",
    title: "Your AI Crew — Cinematic Hero",
    soraCameoHandles: ["@shai-lfc"],
    duration: "20s",
    style: "cinematic",
    prompt: `Open on a slow dolly push through a pitch-black void. Tiny particles of teal (#4ecdc4) light drift like digital fireflies. A low hum builds. At the 2-second mark a single overhead spotlight — warm tungsten mixed with cool rim light — reveals @shai-lfc standing center frame in a tailored dark navy blazer over a black crew neck. He is mid-stride, walking directly toward the camera on a reflective obsidian floor that mirrors the teal particles above. The camera is set at a low angle, roughly knee height, steadicam tracking backwards to keep him perfectly centered as the environment constructs itself around him.

At 4 seconds, translucent holographic panels flicker into existence on both sides — left panel shows a VideoForge timeline rendering a real-estate walkthrough, right panel displays a SocialHub feed auto-scheduling Instagram Reels. The panels glow with a subtle orange (#f47920) edge light. @shai-lfc gestures casually to his left without breaking stride; as his hand sweeps, a third panel materializes ahead showing a FrontDesk AI answering a phone call, the caller's waveform pulsing teal.

At 10 seconds the camera executes a smooth 180-degree orbit around @shai-lfc. During the orbit we see behind him: a massive digital war-room wall with six AI agent cards — Forge, Scout, Buzz, Spoke, FrontDesk, Market — each card glowing orange on navy with a live activity feed. The lighting shifts to dramatic split light: orange key from camera-left, teal fill from camera-right, casting a confident dual-tone shadow on @shai-lfc's face.

At 15 seconds @shai-lfc stops walking, looks directly into the lens with a knowing half-smile, and raises one hand palm-up. A miniature holographic SuperSeller logo assembles itself above his palm — the iconic S in orange and teal rotating slowly, emitting soft god-rays. The camera cranes up and pulls back into a wide establishing shot revealing the full environment: @shai-lfc at the center of a circular command deck, six agent holograms orbiting him like planets, teal particle field overhead, reflective floor below.

Final 3 seconds: the logo expands to fill the frame, background fades to pure navy (#0d1b2e), tagline "YOUR AI CREW FOR BUSINESS" fades in below in Outfit 700 weight, orange (#f47920). Shallow depth of field throughout, anamorphic lens flares on light sources, film grain at 5% for cinema texture. Color grade: crushed blacks, lifted teal midtones, warm orange highlights.`,
    voiceoverText: "Your business deserves a crew that never sleeps, never complains, and never misses a lead. Meet your AI Crew — six intelligent agents handling content, leads, calls, social, and video while you focus on what you do best. SuperSeller AI. Your AI Crew for Business.",
    music: "Cinematic orchestral hybrid opening with sub-bass drone at 40Hz, layered with ethereal pad synths in D minor. At the 4-second mark, introduce plucked string ostinato pattern building tension. At 10 seconds, a massive percussion hit — taiko drums mixed with electronic transient — triggers the full arrangement: soaring violins, driving electronic beat at 95 BPM, and a confident brass motif. Final 5 seconds resolve to a single sustained chord with reverb tail. Mood: epic, premium, tech-forward. Reference: Hans Zimmer meets Trent Reznor.",
    purpose: "hero",
  },
  {
    id: "ss-demo-reel-01",
    business: "superseller-ai",
    title: "Product Demo — VideoForge & SocialHub in Action",
    soraCameoHandles: ["@shai-lfc"],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a tight close-up of a laptop screen — we see a Zillow listing URL being pasted into a glowing input field with an orange (#f47920) border. The interface reads "VideoForge" in Outfit font. A cursor clicks "Generate." Immediately, a progress bar races across the screen emitting teal (#4ecdc4) sparks. Whip pan right — the camera moves at high speed with motion blur to reveal a second screen showing SocialHub: an Instagram grid populating in real-time with auto-generated Reels, carousels, and stories. Each post has engagement metrics ticking upward: likes, comments, shares.

Cut to a medium shot — @shai-lfc sitting at a standing desk in a modern home office with navy (#0d1b2e) accent wall behind him. Three ultra-wide monitors glow with dashboards. He leans back in his chair, arms crossed, grinning confidently at the camera. The monitors behind him show: left — a finished real-estate video playing, center — a lead notification board with 12 new leads pulsing green, right — a social media calendar fully populated for the month.

Quick match cut to a phone screen in someone's hand — an Instagram notification appears: "superseller.agency posted a Reel." The thumb taps it and we see the auto-generated video playing. The phone tilts toward camera revealing the view count climbing.

Final 2 seconds: split screen — left side shows raw Zillow URL, right side shows the finished cinematic property video. Text overlay in Outfit Bold: "LISTING TO VIDEO. 60 SECONDS." Orange text on navy background. Hard cut to SuperSeller logo.

Camera style: handheld energy for the desk shots with subtle micro-movements, locked-off and smooth for screen captures. Lighting: cool blue ambient from monitors, warm key light at 45 degrees on @shai-lfc. Color grade: high contrast, vivid teal and orange, desaturated midtones.`,
    voiceoverText: "Paste a listing. Get a cinematic video. Auto-schedule to every platform. Sixty seconds, zero effort. VideoForge and SocialHub — your AI content engine is live.",
    music: "High-energy electronic pop at 128 BPM, snappy finger snaps on beats 2 and 4, punchy 808 kick, bright synth arpeggios in A major. Quick risers and impact hits on every cut. Think: tech startup launch trailer meets TikTok trending sound. Confident, fast, modern.",
    purpose: "reel",
  },
  {
    id: "ss-testimonial-01",
    business: "superseller-ai",
    title: "The Founder Story — Documentary",
    soraCameoHandles: ["@shai-lfc"],
    duration: "20s",
    style: "documentary",
    prompt: `Open on a tight close-up of @shai-lfc's hands typing on a mechanical keyboard, the keys softly clacking. Shallow depth of field — only the fingertips and keys are sharp, everything else is a warm bokeh wash. Natural window light from camera-right creates a soft Rembrandt pattern on his hands. Slowly rack focus to reveal @shai-lfc's face in a medium close-up. He is sitting in a modern chair, slightly off-center (rule of thirds, camera-left), with a minimalist bookshelf and a single potted monstera plant soft in the background. He wears a simple dark henley. The mood is intimate, authentic, real.

He begins speaking directly to camera. His expression is earnest, leaning slightly forward. As he talks, we intercut B-roll: a slow dolly shot across a small business owner's desk covered in sticky notes and a ringing phone (the "before"); a time-lapse of code scrolling on a dark IDE; a close-up of a phone screen receiving a "New Lead from SocialHub" push notification; a wide shot of a happy restaurant owner reviewing her Instagram analytics on a tablet, smiling.

At 10 seconds, return to @shai-lfc. The camera has shifted to a slightly wider medium shot, revealing more of the room — warm wood tones, soft Edison bulb in the background slightly overexposed for atmosphere. He gestures with his right hand, palm up, emphasizing a point. His eyes are direct, convicted.

At 14 seconds, a slow push-in begins — the camera creeps closer as his voice becomes more passionate. The background blurs further. B-roll flash: a montage of diverse small business owners — a contractor on a job site checking his phone, a florist arranging a display with a laptop open to her AI dashboard, a locksmith's van with his phone showing 3 new booking notifications. Each shot is 1.5 seconds, warm natural lighting, handheld with gentle movement.

Final 4 seconds: back to @shai-lfc, now in a tight close-up, slight smile, nods once. Hold for a beat. Dissolve to navy (#0d1b2e) background, SuperSeller logo centered, tagline "Your AI Crew for Business" in orange (#f47920) below, Outfit typeface.

Lighting throughout: natural and warm, no hard studio lights. Key from a large window, negative fill on shadow side for depth. Color grade: warm highlights, slightly lifted blacks for a filmic look, desaturated greens and blues, skin tones preserved and flattering. Aspect ratio: 16:9 with subtle letterboxing for cinema feel.`,
    voiceoverText: "I built SuperSeller AI because I watched small business owners drown in busywork they never signed up for. They are incredible at their craft — remodeling kitchens, baking cakes, fixing pipes — but nobody taught them to be a marketer, a social media manager, and a receptionist at the same time. So I built a crew that handles all of it. Your AI Crew generates content, answers calls, finds leads, and posts to your socials — while you do what you actually love. That is the whole idea. You focus on your craft. Your AI Crew handles the rest.",
    music: "Intimate documentary score: solo piano in C major, gentle and unhurried, with subtle string pad entering at the 10-second mark adding warmth. Light finger-picked acoustic guitar layered underneath. No percussion until the final 5 seconds where a soft kick drum provides gentle momentum for the logo resolve. Mood: authentic, human, hopeful. Reference: the emotional tone of an Apple product documentary.",
    purpose: "testimonial",
  },
  {
    id: "ss-social-proof-01",
    business: "superseller-ai",
    title: "Dashboard Metrics — Social Proof",
    soraCameoHandles: ["@shai-lfc"],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a macro close-up of a phone screen lying on a dark navy (#0d1b2e) desk surface. The phone vibrates — a push notification slides down: "New Lead: David M. — Garage Door Repair Inquiry." Before it fades, another notification stacks on top: "SocialHub: 3 posts published." Then another: "FrontDesk: Call answered, appointment booked." The notifications keep stacking rapidly, each one emitting a subtle orange (#f47920) glow as it appears. The camera is locked off, directly overhead, bird's-eye view.

At 3 seconds, a hand — @shai-lfc's — reaches into frame and picks up the phone. The camera follows the phone upward with a smooth tilt, revealing @shai-lfc in a medium shot, standing in a modern kitchen (he is a business owner at home, casual). He glances at the phone, raises his eyebrows with a satisfied smile, then turns the phone toward camera so we can see the screen.

The screen now shows a SuperSeller AI dashboard: a line graph trending sharply upward (leads per week), a counter showing "847 leads generated this quarter" ticking to 848 in real-time, social media engagement metrics with green arrows, and a row of recent activity showing automated posts, answered calls, and booked appointments. Each metric element has a subtle teal (#4ecdc4) glow.

At 7 seconds, quick-fire montage — 4 rapid cuts, each 0.5 seconds: (1) a phone ringing with the FrontDesk AI avatar answering, (2) an Instagram Reel view counter spinning from 200 to 12K, (3) a calendar filling up with appointments highlighted in orange, (4) a text message reading "Thanks for the quick response! When can you start?"

Final 2 seconds: @shai-lfc pockets his phone, picks up a coffee mug, takes a sip, and walks away casually. Text overlay appears: "YOUR AI CREW NEVER STOPS." in Outfit Bold, white on navy with orange underline. Logo bottom-right corner.

Camera: overhead macro for opening, steadicam medium shot for @shai-lfc, snap-zooms for montage. Lighting: warm morning kitchen light, phone screen glow as accent. Color grade: clean, vibrant, slightly cool shadows with warm highlights.`,
    voiceoverText: "While you slept, your AI Crew answered four calls, published six posts, and generated twelve new leads. Just another Tuesday. SuperSeller AI — your business, on autopilot.",
    music: "Upbeat lo-fi hip-hop at 90 BPM with vinyl crackle and warm Rhodes piano chords. Punchy sidechain-compressed kick on the montage section for energy. Bright bell melody line over the top. Confident, chill, modern. Think: a productivity app commercial soundtrack. Ends with a satisfying chord resolution on the logo frame.",
    purpose: "social",
  },
  {
    id: "ss-viral-01",
    business: "superseller-ai",
    title: "Shai x Einstein x GaryVee — AI Debate",
    soraCameoHandles: ["@shai-lfc", "@madeinstein", "@garyvee"],
    duration: "10s",
    style: "funny",
    prompt: `Open on a podcast-style setup: three chairs around a small round table with microphones. The set is lit with moody blue and orange gels — navy (#0d1b2e) background with neon strip lights in teal (#4ecdc4) along the ceiling edges. A sign on the wall reads "SUPERSELLER PODCAST" in Outfit Bold, glowing orange.

@shai-lfc sits camera-center, leaning forward with his elbows on the table, animated mid-conversation. To his left, @madeinstein (Albert Einstein character) sits with wild white hair, wearing his iconic rumpled suit, arms crossed, looking skeptically at @garyvee on the other side. @garyvee is leaning way back in his chair, gesturing emphatically with both hands, classic GaryVee energy.

At 2 seconds, @shai-lfc holds up a hand to pause the conversation, turns to camera with a knowing look, then turns back to @madeinstein and says something. @madeinstein uncrosses his arms, strokes his mustache thoughtfully, then slowly nods. @garyvee slaps the table enthusiastically in agreement.

At 5 seconds, quick cut to a whiteboard behind them. @madeinstein has drawn E=mc² but crossed out c² and written "AI CREW" above it in messy handwriting. @garyvee jumps up from his chair and adds an exclamation mark with a marker. @shai-lfc sits back laughing.

At 7 seconds, all three turn to camera simultaneously. @garyvee points at the lens with intensity. @madeinstein raises an eyebrow with a slight smirk. @shai-lfc gives a single confident nod. Beat.

Final 2 seconds: the camera zooms into the whiteboard equation "E = m × AI CREW!" Text overlay fades in below: "THE ONLY FORMULA YOU NEED." SuperSeller logo in the corner. Hard cut to black.

Camera: three-camera podcast style with a wide establishing shot and two tighter over-the-shoulder angles. Quick cuts between angles to create energy. Handheld micro-movements for authenticity. Lighting: interview-style three-point with colored gels — orange key, teal fill, purple hair light for depth. Color grade: high contrast, saturated, social-media-optimized vivid tones.`,
    voiceoverText: "When Einstein and GaryVee agree on something, you listen. The formula for small business growth just got rewritten. SuperSeller AI.",
    music: "Punchy podcast intro beat — boom-bap hip-hop drums at 85 BPM with a jazzy trumpet sample and vinyl scratch transitions. Quick DJ airhorn hit when @garyvee slaps the table. Drops to a low sub-bass hit on the final zoom. Fun, viral, shareable. Think: Hot Ones intro energy.",
    purpose: "social",
  },

  // ═══════════════════════════════════════════════════
  // 2. ELITE PRO REMODELING (3 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "ep-reveal-01",
    business: "elite-pro-remodeling",
    title: "Before & After Luxury Kitchen Reveal",
    soraCameoHandles: ["@flotz"],
    duration: "10s",
    style: "cinematic",
    prompt: `Open on a slow steadicam push into a dated, cramped kitchen. The cabinets are honey oak from the 1990s, the countertops are worn beige laminate, and a single flickering fluorescent tube casts unflattering greenish light. The camera moves at walking pace, slightly below eye level, emphasizing the claustrophobic ceiling. Every surface looks tired. Muted, desaturated color grade — almost sepia, with crushed warm tones to emphasize age and neglect. Dust particles visible in the fluorescent beam.

At 3 seconds, the camera reaches the far wall and begins a smooth 180-degree whip pan — the motion blur streaks across the frame for exactly 0.4 seconds. When the camera settles, we are in the SAME SPACE but completely transformed: a breathtaking open-concept luxury kitchen. Snow-white shaker cabinetry floor to ceiling, waterfall-edge Calacatta marble island stretching eight feet, brushed gold hardware and fixtures catching the light, oversized pendant lights in hand-blown smoked glass casting warm pools on the countertop. The fluorescent tube is gone — replaced by recessed LED cove lighting along the ceiling perimeter and under-cabinet task lights.

The camera continues its steadicam path, now elevated slightly above eye level to emphasize the expansive new ceiling height (they removed the soffit). Natural golden-hour sunlight pours through a new picture window camera-right, creating volumetric light shafts through the space. The color grade shifts dramatically: warm, rich, high-dynamic-range — creamy whites, warm wood tones on the new herringbone floor, gold reflections.

At 6 seconds, @flotz steps into frame from camera-left. He is wearing a clean navy polo with the Elite Pro logo embroidered on the chest. He runs his hand along the marble island edge with visible pride, then turns to camera with a confident, natural smile and gives a single appreciative nod — the craftsman admiring his own work.

At 8 seconds, the camera performs a slow crane-up movement, rising above @flotz to reveal the full kitchen from a high angle. The pendant lights create beautiful starburst lens flares. The marble veining is visible in exquisite detail.

Final 2 seconds: dissolve to a clean white frame. The Elite Pro Remodeling logo fades in — classic serif wordmark in charcoal with a gold accent line. Below: "(800) 476-7608" and "Dallas · Fort Worth". Subtle shadow on the logo for depth.

Lens: 35mm equivalent for the push-in (slightly wide, environmental), switching to 50mm for the reveal (flattering compression). Shallow depth of field on @flotz with f/2.0 bokeh on the background pendants.`,
    voiceoverText: "From outdated to extraordinary. This is what happens when craftsmanship meets vision. Elite Pro Remodeling — transforming Dallas homes into works of art. Call us today.",
    voiceId: "jlOXsp2JeEQ29fkljTTO",
    music: "Begin with a single low piano note sustaining under the 'before' section — sparse, slightly melancholic, with subtle room reverb. On the whip pan transition, a deep bass impact hit with sub-frequency rumble. The 'after' section opens with lush strings in G major, warm cello melody line joined by harp arpeggios and gentle timpani swells. The music blooms as the camera cranes up — full orchestral warmth with a touch of modern electronic shimmer on the high end. Resolve to a gentle sustain on the logo. Mood: luxury home magazine meets HGTV finale moment.",
    purpose: "reel",
  },
  {
    id: "ep-doc-01",
    business: "elite-pro-remodeling",
    title: "A Day on the Job — Craftsman Documentary",
    soraCameoHandles: ["@flotz"],
    duration: "20s",
    style: "documentary",
    prompt: `Pre-dawn. Open on an exterior wide shot of a suburban Dallas home, soft blue pre-dawn light, a single lamp glowing inside. A white Elite Pro Remodeling truck pulls into the driveway, headlights cutting through the early morning mist. Handheld camera from across the street, documentary style, long lens compressing the scene.

Cut to @flotz stepping out of the truck at 2 seconds. Medium shot, natural available light — the sky is transitioning from deep blue to pale gold on the horizon. He pulls on a clean hard hat, grabs a clipboard and a rolled set of blueprints from the passenger seat. His breath is visible in the cool morning air. He walks toward the house with purpose.

At 5 seconds, interior — the gut of a bathroom mid-demolition. @flotz unrolls the blueprints on a makeshift plywood workbench. Close-up insert shot of his hands tracing a pencil line along a wall measurement, the blueprint showing "Master Bath — Freestanding Tub Layout." The camera is handheld, close, intimate — we feel like we are standing next to him. Natural window light from a bare window (no coverings during construction) creates strong directional light with hard shadows.

At 8 seconds, montage sequence — six shots, each 1.5 seconds, edited to the rhythm of the music:
(1) Close-up: a wet tile saw slicing through large-format porcelain, water spray catching sunlight in slow motion (120fps).
(2) Medium: @flotz kneeling, pressing a subway tile into thinset with a gentle twist, perfectly aligned to the laser level line glowing red on the wall.
(3) Detail: a brass shower fixture being hand-tightened, the wrench catching a glint of overhead work light.
(4) Wide: the bathroom taking shape — half-tiled walls, the freestanding tub in position, copper pipes visible where the vanity will go.
(5) Close-up: a bubble level placed on the fresh countertop — the bubble settles perfectly center. Hold for a beat. Satisfying.
(6) Medium: @flotz stepping back from the vanity he just installed, wiping his hands on a rag, surveying the progress.

At 17 seconds, the finished bathroom. The camera performs a slow, reverent dolly across the completed space. Everything is pristine: floor-to-ceiling marble-look porcelain, the freestanding soaking tub beneath a new window, double vanity with undermount sinks and brushed gold faucets, a frameless glass shower enclosure with rainfall showerhead. Soft diffused natural light fills the room. Steam gently rises from the tub (they filled it for the reveal shot).

@flotz stands in the doorway at 19 seconds, arms crossed over his chest, weight on one leg — the universal pose of a craftsman admiring finished work. He nods once, slowly, with genuine satisfaction. The camera holds on his silhouette framed by the glowing bathroom behind him.

Final second: fade to white. Logo and phone number. No text overlay during the documentary portion — let the craft speak.

Color grade: warm and natural throughout, slightly desaturated for documentary authenticity, with golden highlights pushed in the finish reveal. Film grain at 8% for texture. Aspect ratio: 2.39:1 widescreen letterbox for cinematic documentary feel.`,
    voiceoverText: "Every tile. Every joint. Every measurement. It is not just a renovation — it is a commitment. From first light to final walkthrough, the Elite Pro crew treats your home like it is their own. That is not a slogan. It is how we were raised. Elite Pro Remodeling — Dallas craftsmanship you can trust.",
    // NO voiceId — this is Noam (@flotz) on screen. Never pair someone else's cloned voice with another person's face.
    // If Noam's voice is needed, clone HIS voice first. Until then, use generic TTS or no voiceover.
    music: "Warm acoustic guitar fingerpicking in open D tuning, gentle and unhurried, setting the pre-dawn mood. Light brushed snare enters at the montage (8 seconds), adding subtle rhythm without overpowering. A warm upright bass joins at 12 seconds. For the finished reveal at 17 seconds, introduce soft strings — viola and cello — playing a simple, heartfelt melody in D major. The arrangement builds gently, never becoming bombastic. Final note: a sustained guitar harmonic with natural room decay. Mood: honest, warm, craftsmanship pride. Reference: a premium HGTV reveal meets indie documentary score.",
    purpose: "social",
  },
  {
    id: "ep-ad-01",
    business: "elite-pro-remodeling",
    title: "Dallas Luxury Remodeling — Aerial Cinematic Ad",
    soraCameoHandles: ["@flotz"],
    duration: "20s",
    style: "cinematic",
    prompt: `Open with a sweeping drone shot — camera at 200 feet altitude, golden hour, facing west. The Dallas skyline glitters on the horizon, the Reunion Tower and Bank of America Plaza catching the last orange sunlight. The drone descends smoothly, banking left in a cinematic arc, as the skyline gives way to tree-lined residential streets. We are entering Highland Park — the camera drops to 80 feet, revealing manicured lawns, mature live oaks, and stately homes. The light is exquisite: low-angle golden sun casting long shadows across the neighborhood.

At 4 seconds, the drone locks onto a specific property — a large Mediterranean-revival home with a new addition visible on the south side (fresh stucco, clean lines). The camera spirals down in a controlled descending orbit, from 80 feet to 15 feet, transitioning from aerial to ground-level as it reaches the front entrance. The move is seamless — one continuous shot.

At 7 seconds, the camera passes through the open front door (a dramatic 10-foot entry with custom iron and glass door) into the interior. We are now on a steadicam or gimbal, gliding at hip height through the home. The interior is stunning: an open-concept great room with 20-foot coffered ceilings, wide-plank white oak floors, a statement stone fireplace wall, and floor-to-ceiling steel-framed windows flooding the space with warm light. Fresh flowers on the island, every surface immaculate.

At 10 seconds, the camera glides into the kitchen — a masterpiece of design. Twelve-foot island in honed Taj Mahal quartzite, custom navy (#0d1b2e, coincidentally matching the SuperSeller palette) cabinetry with brass hardware, a La Cornue range in ivory, and a butler's pantry visible through an arched doorway. The camera lingers, moving slowly to let the details register.

At 13 seconds, the camera transitions through a hallway into the master suite and spa bathroom. Bookmatched marble walls, a freestanding Victoria + Albert tub centered under a chandelier, walk-in shower with multiple body jets and a linear drain. Steam gently fogs the frameless glass. Every fixture is brushed gold.

At 16 seconds, cut to the backyard. Wide shot: @flotz stands at the edge of a newly completed outdoor living space — a covered pavilion with a full outdoor kitchen, a geometric infinity-edge pool reflecting the sunset sky, and landscaping with uplighting that is just beginning to glow as dusk settles. @flotz turns partially toward camera, gesturing toward the pool with an open hand — presenting his work. His expression is calm confidence, not salesy.

At 18 seconds, the homeowners — a well-dressed couple in their 40s — walk through the back door for the first time. The woman covers her mouth. The man puts his arm around her shoulder. They look at @flotz. He extends his hand. The man shakes it firmly, pulling him into a grateful half-hug. Genuine emotion.

Final 2 seconds: aerial pull-back from the property, rising to 100 feet, the pool glowing aquamarine in the twilight, landscape lights twinkling. Dissolve to: "ELITE PRO REMODELING" in elegant serif, "Luxury Kitchen · Bath · Whole-Home" below, phone number "(800) 476-7608", "Dallas · Fort Worth" at the bottom. All text in warm white on a deep charcoal background.

Camera: DJI Inspire 3 drone for exteriors, Arri-style gimbal for interiors, seamless transition at the door. Lens: 24mm wide for architecture, 50mm for the handshake moment. Color grade: rich golden hour tones, lifted shadows for a luminous feel, slightly warm whites, skin tones flattering and natural. Anamorphic lens flares on the sunset and pool reflections.`,
    voiceoverText: "In the most discerning neighborhoods in Dallas, one name keeps coming up. Elite Pro Remodeling — luxury kitchens, spa bathrooms, and whole-home transformations that exceed every expectation. Licensed. Insured. Obsessed with perfection. Your dream home is one call away.",
    voiceId: "jlOXsp2JeEQ29fkljTTO",
    music: "Grand cinematic orchestral score in E-flat major. Open with a solo French horn over sustained strings as the drone descends — majestic and Texan, evoking wide-open grandeur. At 7 seconds (entering the home), transition to an intimate string quartet with warm cello melody. Build gradually through the kitchen and bathroom with layered woodwinds and gentle harp glissandos. At 16 seconds, the full orchestra swells — brass, strings, timpani roll — as the homeowners react. Resolve to a warm, resonant final chord on the logo. Add a subtle steel guitar accent woven into the orchestral texture for a touch of Texas identity. Mood: luxury, emotional, aspirational. Reference: Toll Brothers national TV campaign meets Hans Zimmer residential.",
    purpose: "ad",
  },

  // ═══════════════════════════════════════════════════
  // 3. YORAM FRIEDMAN INSURANCE (3 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "yf-hero-01",
    business: "yoram-friedman-insurance",
    title: "Trust & Credibility — Hebrew Hero",
    soraCameoHandles: ["@shai-lfc"],
    duration: "20s",
    style: "cinematic",
    prompt: `Open on a warm, sunlit office interior — modern Israeli aesthetic with clean white walls, light wood desk, a potted olive tree in the corner, and a large window revealing a Mediterranean cityscape (Tel Aviv or Herzliya skyline) bathed in soft morning light. The camera performs a slow dolly-in from a wide establishing shot, starting outside the window and moving through the glass (seamless VFX transition) into the office.

At 3 seconds, @shai-lfc enters the frame from camera-right, walking naturally into the office. He is dressed smart-casual: a well-fitted button-down shirt, no tie, sleeves slightly rolled — approachable Israeli professional style. He sits on the edge of the desk, one foot on the floor, facing camera at a three-quarter angle. The lighting is key from the window — natural, warm, with a soft fill bounce from the white walls. No hard shadows. The look is clean, trustworthy, modern.

At 5 seconds, @shai-lfc begins speaking directly to camera in a conversational manner. He gestures naturally — hands open, palms up, the body language of honesty. Behind him on the desk, we can see framed family photos and a small Israeli flag. On the wall behind: professional insurance certifications in Hebrew and a photo of a man in his 50s — Yoram Friedman — shaking hands with a client (this is the father, the insurance expert).

At 10 seconds, B-roll intercut: a slow pan across a Hebrew-language document — an insurance policy with highlighted coverage sections. Cut to a close-up of a family (Israeli, warm Mizrachi features) laughing around a Shabbat dinner table — candles lit, challah on the table, kids reaching for food. The image is warm, golden, intimate. Cut to a wider shot of a car on a highway with beautiful Israeli landscape — the Carmel mountains or coastal road — implying car insurance and the life being protected.

At 14 seconds, return to @shai-lfc in the office. He stands up from the desk, walks to the window, and looks out at the city. The camera follows with a slow tracking shot. He turns back to camera and speaks his final line with conviction and warmth.

At 17 seconds, the camera pushes past @shai-lfc to the window, and the city view dissolves into a clean white background. The Yoram Friedman Insurance logo fades in — Hebrew text right-to-left: "יורם פרידמן — סוכן ביטוח" in a clean, trustworthy serif typeface. Below: "yoramfriedman.co.il" and a phone number. A thin gold accent line separates the name from the website. The text layout is RTL-native, properly set.

Final 2 seconds: hold on the logo with a subtle light animation — a gentle gold shimmer passes across the text from right to left (RTL direction, intentional).

Color palette: warm whites, soft golds, olive greens, Mediterranean blues. No navy/orange SuperSeller branding — this is Yoram's identity. Color grade: warm, slightly lifted shadows, golden highlights, natural skin tones. Film grain at 3%.`,
    voiceoverText: "אבא שלי, יורם פרידמן, עובד בתחום הביטוח כבר יותר משלושים שנה. הוא לא סוכן שמוכר לך פוליסה ונעלם — הוא הבן אדם שעונה לך בטלפון כשמשהו קורה. ביטוח חיים, ביטוח רכב, ביטוח דירה, ביטוח בריאות — הכל מותאם אישית, הכל עם ליווי צמוד. כי ביטוח זה לא מסמך — זה שקט נפשי. יורם פרידמן ביטוח. שלושים שנה של אמון.",
    music: "Warm Mediterranean-inspired score: nylon-string classical guitar playing a gentle arpeggio pattern in A minor, joined by a soft oud (Middle Eastern lute) melody at the 5-second mark. Light hand percussion — darbuka at low volume — enters at 10 seconds during the family B-roll. At 14 seconds, add warm strings (small chamber ensemble) for emotional depth. The arrangement stays intimate and personal throughout — never bombastic. Resolve to a single sustained guitar chord with natural reverb on the logo. Mood: trustworthy, familial, Israeli warmth. Reference: the emotional tone of an Israeli bank commercial (Discount, Hapoalim) — warm, human, rooted.",
    purpose: "hero",
  },
  {
    id: "yf-testimonial-01",
    business: "yoram-friedman-insurance",
    title: "Happy Client — Israeli Family",
    soraCameoHandles: [],
    duration: "10s",
    style: "documentary",
    prompt: `Open on a medium shot of a warm Israeli home interior — a living room with terracotta floor tiles, a large comfortable sofa, family photos on a shelf, and soft afternoon light filtering through sheer curtains. The aesthetic is distinctly Israeli middle-class: clean but lived-in, warm colors, a mix of modern IKEA-style furniture with traditional touches (a decorative hamsa on the wall, a menorah on the shelf).

A family sits on the sofa: a man and woman in their mid-30s, a young girl (around 6) between them, and a toddler on the mother's lap. They are relaxed, natural, smiling. The camera is at eye level, slightly wide (35mm), with the shallow depth of field softening the background. Lighting: natural window light from camera-left, warm and gentle, with a small practical lamp in the background adding a pool of amber light.

At 2 seconds, the man speaks to camera — Hebrew, casual and genuine. He gestures toward his wife. She nods in agreement, adds a comment. They look at each other and share a natural laugh. The daughter looks up at her parents, then back at the camera with a shy smile. The toddler is oblivious, playing with a toy.

At 5 seconds, cut to a close-up insert: the family's insurance documents on a kitchen table, a phone screen showing a WhatsApp conversation with "יורם פרידמן ביטוח" — the last message reads "הכל מסודר, אל תדאג 👍". This shot is 1.5 seconds — enough to read but not linger.

At 6.5 seconds, back to the family. Wide shot now — the camera has pulled back to include more of the living room, giving a sense of their home, their life, their space. The mother holds the toddler close. The father puts his arm around the daughter. They are visually grounded, safe, protected — the insurance metaphor made human without saying it.

At 8 seconds, the daughter waves at the camera. The parents laugh.

Final 2 seconds: gentle dissolve to the Yoram Friedman logo on warm white background. Hebrew RTL text: "יורם פרידמן ביטוח — שקט נפשי למשפחה שלך". Gold accent line. Website URL.

Camera: locked off on a tripod for stability and documentary trust, with a gentle 2% drift to avoid feeling sterile. Color grade: warm golden tones, slightly lifted blacks, natural skin tones. The grade should feel like a warm Saturday afternoon.`,
    voiceoverText: "כשקרה לנו מקרה ביטוח, יורם היה הראשון שהתקשר. לא השאיר אותנו לבד מול החברה. סידר את הכל, הסביר כל שלב. אנחנו ממליצים עליו לכל המשפחה. יורם פרידמן ביטוח — שקט נפשי אמיתי.",
    music: "Simple, warm piano melody in F major — slow, gentle, with lots of space between notes. A light string pad (viola and cello) enters at 5 seconds for warmth. No percussion. The music should feel like sunlight through a window — present but not demanding attention. Resolve on a warm major chord. Mood: trust, family, peace of mind.",
    purpose: "testimonial",
  },
  {
    id: "yf-explainer-01",
    business: "yoram-friedman-insurance",
    title: "Insurance Options — Visual Explainer",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a clean white background with subtle warm texture (like handmade paper). A hand — drawn in a friendly, modern illustration style but photorealistic environment around it — places a miniature house model center frame. The camera is directly overhead, bird's-eye view, locked off. The house casts a soft shadow.

At 1.5 seconds, a translucent golden shield materializes around the house — this is home insurance, visualized. Hebrew text animates in from the right (RTL): "ביטוח דירה" in clean sans-serif. The shield pulses gently with warm light.

At 3 seconds, the camera performs a smooth whip pan to the right. A new vignette: a miniature car (modern, silver) on the white surface. A similar golden shield wraps around the car. Text: "ביטוח רכב". The shield has a slightly different texture — more angular, more dynamic.

At 4.5 seconds, another whip pan. A miniature family figurine set — mother, father, two children — standing together. The golden shield that forms around them is the largest and warmest, pulsing like a heartbeat. Text: "ביטוח חיים". Hold for a beat longer than the others — this is the most emotional beat.

At 6 seconds, whip pan to a stethoscope and a small heart shape. Golden shield. Text: "ביטוח בריאות". Quick and confident.

At 7 seconds, the camera rapidly zooms out — pulling back from the overhead view to reveal all four vignettes arranged in a grid on the white surface. The golden shields on each one pulse in sync, creating a unified glow. The miniature objects are connected by thin golden lines forming a network — the complete coverage visualization.

At 8.5 seconds, the grid dissolves upward like golden particles, reforming into the Yoram Friedman logo. The particles settle into the Hebrew text: "יורם פרידמן ביטוח — הכל תחת קורת גג אחת" (Everything Under One Roof). Gold on white, RTL layout, clean and authoritative.

Final 1.5 seconds: the logo holds with a subtle shimmer. Website and phone number fade in below.

Camera: entirely overhead/top-down for the vignettes, pulling to a slight angle on the zoom-out. Macro lens for the miniatures, giving beautiful shallow depth of field on the tiny objects. Lighting: bright, even, warm — like a well-lit product photography studio with soft diffusion. Color grade: clean whites, warm golds, minimal color cast. The overall feel should be premium but approachable — not cold or corporate.`,
    voiceoverText: "דירה. רכב. חיים. בריאות. כל הביטוחים שלך — במקום אחד, עם סוכן אחד שמכיר אותך. יורם פרידמן — ביטוח שמותאם לך אישית.",
    music: "Light, modern pop instrumental at 110 BPM — clean electric piano chords with a gentle four-on-the-floor kick and soft hi-hats. Bright marimba melody playing a simple ascending pattern that matches the visual reveals. Each whip pan gets a subtle whoosh sound design element. The zoom-out gets a satisfying low-end swell. Mood: clear, trustworthy, modern, Israeli commercial. Reference: the tone of a Wix or Monday.com Hebrew ad.",
    purpose: "ad",
  },

  // UAD — removed (client doesn't want videos)
  // MissParty — removed (client doesn't want videos)
  // Kedem — removed (ghosted after video delivery)

  // ═══════════════════════════════════════════════════
  // PLACEHOLDER — future client videos go here
  // ═══════════════════════════════════════════════════

  //_REMOVED_UAD_MISSPARTY_KEDEM_START_
  /*
    business: "uad-garage-doors",
    title: "Service Showcase — Before & After",
    soraCameoHandles: [],
    duration: "10s",
    style: "cinematic",
    prompt: `Open on a suburban DFW home exterior — the camera is positioned at the end of the driveway, low angle (18 inches off the ground), looking up at the house. It is mid-morning, slightly overcast sky providing soft, even illumination. The garage door is the focal point: it is old, dented, paint peeling, one panel visibly warped, the hardware rusted. A crack of light shows where the door does not seal properly at the bottom. The lawn is neat but the garage door makes the whole house look neglected. The camera slowly dollies forward up the driveway toward the door.

At 2.5 seconds, hard cut to black — a single frame. Then slam cut to the AFTER: the same angle, same driveway, same house, but a brand-new garage door commands the frame. It is a contemporary flush-panel design in charcoal with brushed nickel hardware, perfectly sealed, with decorative windows across the top panel letting warm light glow from inside the garage. The entire house looks transformed — the new door elevates the curb appeal dramatically. The camera continues the same dolly motion forward, creating a seamless match cut that emphasizes the before/after.

At 5 seconds, the camera reaches the garage door and tilts up to take in the full height. A UAD service technician stands beside the door in a clean uniform (navy polo, khaki pants, tool belt). He presses a remote — the door opens smoothly, silently, the motor barely audible. The camera pushes through the opening door into the garage interior: organized, clean, the ceiling-mounted opener with LED light illuminating the space. A family car is parked inside.

At 7 seconds, cut to a montage — three quick shots: (1) Close-up of the new door's weather seal pressing firmly against the concrete threshold — airtight. (2) A hand testing the door balance — it stays perfectly at the halfway point, properly tensioned springs. (3) The homeowner (a DFW suburban dad in his 40s) shaking hands with the technician on the driveway, the beautiful new door behind them, both smiling.

Final 2 seconds: the camera is back at the end of the driveway, wide shot. The homeowner stands back admiring the new door. A text overlay appears: "UAD GARAGE DOORS — SALES · SERVICE · REPAIR" in bold sans-serif, white text with a dark drop shadow for readability. Below: "DFW Metro Area" and phone number. The house and door fill the background.

Camera: steadicam dolly for the approach, handheld for the montage, locked wide for the final. Lens: 35mm wide for architecture, 85mm tight for details. Color grade: clean, bright, slightly warm — the "after" shots should feel crisp and new, the "before" should feel dull and aged. Natural suburban lighting.`,
    voiceoverText: "Your garage door is the first thing people see. Dented, faded, and stuck? UAD Garage Doors transforms your curb appeal in a single visit. Sales, service, and repair across the entire DFW metro. Call today — your home deserves better.",
    music: "Modern corporate pop at 100 BPM — clean acoustic guitar strumming with a light electronic beat, upbeat but not aggressive. A bass impact hit on the before/after slam cut. The montage section gets a slightly faster rhythm with added claps. Resolve to a confident, clean ending on the logo. Mood: trustworthy, suburban, professional. Reference: a Home Depot or Lowe's TV spot — clean, aspirational, home improvement.",
    purpose: "ad",
  },
  {
    id: "uad-emergency-01",
    business: "uad-garage-doors",
    title: "Emergency Repair — Fast Response Ad",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a dramatic close-up of a garage door that has gone catastrophically wrong — the door is stuck halfway open at an angle, one cable snapped and dangling, a spring visibly broken. It is evening, the driveway lit by a single porch light casting harsh shadows. Rain is falling — droplets visible in the light beam. A car is trapped inside the garage, its headlights on, illuminating the broken door from behind. The homeowner (a woman in her 30s, in work clothes, holding grocery bags) stands on the driveway looking up at the mess with visible frustration. The camera is handheld, slightly shaky — we feel the urgency.

At 2 seconds, she pulls out her phone and dials. Close-up insert of the phone screen: "UAD Garage Doors — Emergency Repair" with a green call button. She taps it.

At 3 seconds, dramatic time-skip transition — the camera whip-pans to the right, motion blur, and when it settles the scene has changed: it is 45 minutes later (a clock on the garage wall shows the time jump), the rain has lightened to a drizzle, and a UAD service van is now parked in the driveway with its work lights on, casting professional bright white illumination on the garage. A technician is already at work — close-up of his hands replacing the torsion spring with practiced efficiency, safety glasses on, professional tools organized on a portable workstation.

At 5.5 seconds, quick montage: (1) the new spring being wound with a winding bar — smooth, precise movements, (2) the cable being re-threaded onto the drum, (3) the technician pressing the wall button — the door glides down perfectly, smoothly, silently, settling onto the concrete with a satisfying seal.

At 8 seconds, wide shot — the driveway scene is now calm. The rain has stopped. The garage door is closed, perfect, operational. The homeowner stands next to the technician, relief visible on her face, shaking his hand. Her car is now out of the garage, parked on the driveway. She is smiling for the first time in the video.

Final 2 seconds: the UAD van drives away, taillights glowing. Text overlay on the darkening sky: "BROKEN DOOR? WE'RE THERE IN 60 MINUTES." Below: "UAD GARAGE DOORS — 24/7 EMERGENCY REPAIR — DFW" and phone number. White text, bold, with a subtle red accent on "60 MINUTES" for urgency.

Camera: handheld and urgent for the opening, locked off and professional once the technician arrives (visual contrast = problem vs. solution). Lighting: dramatic and moody for the emergency, clean and bright for the repair. Color grade: cool, desaturated blues in the emergency shots, warm and resolved in the repair/completion shots.`,
    voiceoverText: "Stuck. Broken. Pouring rain. One call — and UAD Garage Doors is at your door in under an hour. Twenty-four-seven emergency repair across DFW. Because a broken garage door does not wait until morning.",
    music: "Open with tense, minimal electronic pulse — low synth drone at 60 BPM with a ticking clock sound effect building urgency. On the whip-pan transition, a dramatic bass drop resolves the tension into a confident, driving beat at 95 BPM — clean drums, positive chord progression in C major. The montage gets quick rhythmic hits synced to each cut. Final moments resolve to a warm, reassuring sustained chord. Mood: problem-to-solution arc, urgency to relief. Reference: an insurance emergency response commercial.",
    purpose: "ad",
  },

  // ═══════════════════════════════════════════════════
  // 5. MISSPARTY (2 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "mp-party-01",
    business: "missparty",
    title: "Party in Action — Kids Having a Blast",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a wide establishing shot of a suburban Dallas backyard on a perfect Saturday afternoon — blue sky, green grass, mature trees providing dappled shade. Center frame: a massive, colorful bounce house (castle theme with turrets, in bright primary colors — red, blue, yellow, green) fully inflated and surrounded by excited children. Balloons in clusters tied to the fence posts. A folding table to the side is covered with a themed tablecloth, party plates, and a tiered cake. The camera is slightly elevated (drone at 15 feet) to capture the full scene, slowly descending.

At 2 seconds, the camera transitions to ground level — a low-angle steadicam shot racing toward the bounce house. We see it from a child's perspective: the bounce house looms large and magical. Children (ages 5-8, diverse group) are visible through the mesh windows, bouncing wildly, mouths open in screams of joy, hair flying. Three kids are climbing the inflatable slide on the side.

At 4 seconds, cut to INSIDE the bounce house — the camera is somehow inside, low angle, wide lens (16mm equivalent creating a fun barrel distortion). Children bounce in slow motion (120fps), faces caught mid-laugh, hair frozen in mid-air, one kid doing a cannonball in frozen time. Confetti particles drift through the air, catching sunlight streaming through the mesh walls. The colors inside are vivid — saturated primary colors everywhere. This is pure, unfiltered childhood joy.

At 6 seconds, resume normal speed. Quick montage: (1) A parent standing back with crossed arms, watching with a content smile, phone in pocket (not filming — actually enjoying it). (2) A close-up of small hands reaching for a slice of cake, frosting getting on a chin. (3) Two kids sliding down the inflatable slide, arms raised, yelling. (4) A cluster of balloons bouncing in the breeze against the blue sky — bright, poppy, Instagram-perfect composition.

At 8.5 seconds, wide shot — the party in full swing from a slightly elevated angle. A second inflatable is visible: a water slide with kids splashing. Parents are clustered under a shade canopy, chatting and laughing. The vibe is easy, fun, zero stress — the perfect party that runs itself.

Final 1.5 seconds: the camera tilts up from the party to the sky. Colorful balloons float upward. Text overlay appears against the blue sky: "MISSPARTY" in a fun, rounded bold typeface with a rainbow gradient. Below: "Bounce Houses · Water Slides · Party Rentals — DFW" and a phone number. A small bouncing animation on the logo — it literally bounces once on the text. Playful.

Camera: drone for establishing, steadicam for ground level, GoPro-style wide for inside the bounce house. Lens: ultra-wide for fun distortion inside, standard 35mm outside. Color grade: vivid, saturated, warm — push the blues in the sky, the greens in the grass, and the primaries on the inflatables. Everything should look like a perfect summer day turned up to 11. No desaturation, no moodiness — pure color joy.`,
    voiceoverText: "The bouncing. The laughing. The cake faces. The memories that last forever. MissParty brings the fun — bounce houses, water slides, and everything you need for the perfect DFW party. You bring the kids. We bring the magic.",
    music: "Bright, infectious pop at 125 BPM — ukulele strumming with claps, tambourine, and a glockenspiel melody. Whistling hook over the chorus section. During the slow-motion bounce house interior (4-6 seconds), the music drops to a dreamy, pitched-down version before snapping back to full energy. Kids' laughter layered subtly in the mix. Final beat: a fun 'boing' sound effect on the logo bounce. Mood: pure joy, summer, childhood magic. Reference: a Target or Old Navy summer campaign — bright, colorful, feel-good.",
    purpose: "social",
  },
  {
    id: "mp-booking-01",
    business: "missparty",
    title: "Easy Booking — Variety Showcase Ad",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a phone screen in someone's hand — the thumb taps on the MissParty website or Instagram page. The camera is an over-the-shoulder POV, shallow depth of field with the phone screen sharp and the background blurred (a living room). On the screen: a clean, colorful gallery of inflatable options — castle bounce house, tropical water slide, obstacle course combo, toddler playland, carnival-themed mega bounce. Each thumbnail has a price tag and availability indicator. The thumb scrolls through the options smoothly.

At 2 seconds, the thumb taps on "Tropical Water Slide" — the listing expands to show: a large product photo, "Available Saturday March 21st", dimensions, age range, and a big "BOOK NOW" button in bright pink. The thumb taps "BOOK NOW." A confirmation screen slides up: "Your party is booked! Setup crew arrives at 9 AM. Enjoy your party!" with a confetti animation on the phone screen.

At 4 seconds, match cut — the phone screen confetti becomes REAL confetti. We are now at the actual party. The tropical water slide from the listing is inflated and operational in a backyard. Kids are already sliding down it, splashing into the pool at the bottom. The homeowner mom (Michal's customer) is standing by the refreshments, relaxed, chatting with another parent, clearly not stressed — the setup was handled.

At 6 seconds, rapid showcase montage — each shot 1 second, high energy: (1) A massive obstacle course inflatable in a park, kids racing through it. (2) A princess-themed castle bounce house at a little girl's birthday, pink and purple, girls in party dresses bouncing and shrieking. (3) A toddler playland with soft, low bounces, a tiny child tentatively bouncing with a huge grin, a parent standing inside helping. (4) A football-themed bounce house in a yard decorated with team colors, boys doing wrestling moves (safely) inside.

Final 2 seconds: split screen showing all four inflatables from the montage simultaneously, each one buzzing with activity. The split screen collapses inward to reveal the MissParty logo centered on a bright, cheerful background (sky blue with subtle cloud illustrations). Text: "MISSPARTY — Every Party, Every Size, Every Theme." Below: "Book in 60 seconds — DFW delivery & setup included." Phone number and Instagram handle. The logo has a subtle bounce animation.

Camera: close-up macro on phone for booking, wide and dynamic for the party scenes, quick handheld cuts for the montage. Lens: 85mm for phone close-up (beautiful bokeh), 24mm wide for party scenes. Color grade: bright, poppy, high saturation — the complete opposite of moody or dark. Whites are crisp, colors are vivid, shadows are lifted. Every frame should feel like a party invitation.`,
    voiceoverText: "Pick your bounce. Pick your date. Tap book. That is literally it. MissParty delivers, sets up, and picks up — all you do is enjoy the party. Castles, water slides, obstacle courses, toddler zones — whatever your kid dreams up, we inflate it. Book in sixty seconds. DFW delivery included.",
    music: "Upbeat tropical pop at 118 BPM — steel drums over electronic dance beat, bright marimba riff, claps and snaps. A quick breakdown at the match cut (4 seconds) with a bass drop into the party scene. The montage section ramps up energy with added synth layers and a four-on-the-floor kick. Ends with a cheerful chord stab and a whoosh on the logo animation. Mood: summer party, easy, fun, no stress. Reference: a Booking.com vacation ad meets kids' party commercial.",
    purpose: "ad",
  },

  // ═══════════════════════════════════════════════════
  // 6. KEDEM DEVELOPMENTS (2 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "kd-showcase-01",
    business: "kedem-developments",
    title: "Luxury Property Showcase — Cinematic Walkthrough",
    soraCameoHandles: ["@superseller-realtor"],
    duration: "20s",
    style: "cinematic",
    prompt: `Open with a drone shot at dawn — the camera hovers at 300 feet over a sprawling North Dallas lot where a Kedem Developments custom home sits completed. The house is a modern transitional design: clean lines, stone and stucco exterior, a dramatic flat-roof portico over the entrance, floor-to-ceiling windows glowing warm from interior lighting. The surrounding lot is one acre, freshly landscaped with native Texas plantings, a circular motor court in brushed concrete, and a four-car garage. The sky is pre-dawn purple fading to pink on the horizon. The drone descends in a slow, controlled spiral.

At 4 seconds, the drone reaches roofline height and the shot transitions seamlessly to an interior gimbal — the camera glides through the front door (10-foot custom pivot door in walnut and blackened steel) into the entry foyer. Double-height ceiling at 22 feet, a floating staircase in white oak with glass railings, a statement chandelier (modern crystal cluster) hanging from above. The morning light streams through the clerestory windows, casting long golden rectangles on the polished Italian marble floor.

At 7 seconds, the camera glides forward into the great room — open concept with the kitchen visible beyond. @superseller-realtor enters the frame, walking slowly through the space in business professional attire. She gestures toward the living area: a 15-foot stone fireplace wall with built-in shelving, a recessed TV niche, and custom millwork in white oak matching the staircase. She moves naturally, her hand trailing along the back of a designer sofa, guiding the viewer's eye through the space.

At 10 seconds, the camera follows @superseller-realtor into the kitchen — the crown jewel. A 14-foot island in book-matched Calacatta Viola marble with waterfall edges, custom cabinetry in greige with unlacquered brass pulls, a 60-inch Wolf range, and a scullery visible through a pocket door. @superseller-realtor sets her hand on the island and looks back at camera with a knowing expression — this kitchen sells the house.

At 13 seconds, rapid but smooth sequence: the camera floats through the master suite (king bed staged, sheer curtains billowing from an open French door to a private terrace), into the master bath (freestanding Badeloft tub, floor-to-ceiling Dolomite marble, double rain shower), through a glass door to the outdoor living area.

At 16 seconds, the backyard reveal — the camera emerges to an infinity-edge pool overlooking a greenbelt, outdoor kitchen with built-in Big Green Egg and Lynx grill, a fire pit lounge with six Adirondack chairs, and string lights overhead just beginning to twinkle as the sunrise brightens. The pool water is perfectly still, reflecting the pink sky like a mirror. @superseller-realtor stands at the pool edge, the house behind her, and spreads her arms subtly — presenting the complete package.

At 18 seconds, wide drone pullback — the house in full glory, landscape lights glowing, pool reflecting the sky, the Dallas skyline a soft glow on the distant horizon. This is $1.2M of custom-built luxury.

Final 2 seconds: dissolve to a clean, architectural graphic: "KEDEM DEVELOPMENTS" in a modern serif typeface, charcoal on white. Below: "Luxury Custom Homes · $800K — $1.5M · Dallas" and "Daniel Arbel, Principal" with phone and website. A thin gold line accents the logo.

Camera: drone exterior, gimbal interior (one continuous shot feel). Lens: 24mm for architecture wide shots, 35mm for @superseller-realtor medium shots. Lighting: natural dawn light exterior, warm designed interior lighting (every fixture is intentional). Color grade: rich, warm, high dynamic range — the grade should make every surface look tactile. Lifted shadows, warm midtones, no crushed blacks. Anamorphic horizontal flares on window light sources.`,
    voiceoverText: "Kedem Developments does not build houses. They build the home you have been designing in your head for the last ten years — and then they add details you never imagined. Custom luxury homes from eight hundred thousand to one point five million, every one a masterpiece. Your architect's vision. Our builder's obsession. Kedem Developments, Dallas.",
    music: "Elegant cinematic score opening with a solo cello playing a lyrical melody in B-flat major — rich and resonant, establishing luxury. At 7 seconds, add a gentle piano accompaniment with arpeggiated chords. At 13 seconds, introduce a full string section (violins, violas, cellos, basses) playing lush harmonies — the music blooms like walking into a beautiful room. At 16 seconds for the outdoor reveal, add a shimmer of harp and a warm French horn sustaining a single note — majestic but not overwhelming. Resolve to a gentle piano and cello duet on the logo. Mood: the feeling of walking into your dream home for the first time. Reference: a Sotheby's International Realty listing film score.",
    purpose: "hero",
  },
  {
    id: "kd-credibility-01",
    business: "kedem-developments",
    title: "Builder Credibility — Construction to Completion",
    soraCameoHandles: [],
    duration: "10s",
    style: "cinematic",
    prompt: `Open on raw construction — a wide shot of a home in the framing stage. Exposed wood studs form the skeleton of a large two-story structure against a bright Texas sky. Workers in hard hats move purposefully across the site. The camera is on a crane, starting low and rising slowly to reveal the full scale of the project. Dust particles float in the air, backlit by the midday sun. The scene feels honest, industrial, real.

At 2 seconds, begin a rapid time-lapse sequence — construction progresses before our eyes. The framing fills in. Roofing goes on. Windows appear. Stone veneer wraps the exterior. Each stage lasts 0.8 seconds, the camera position consistent (locked-off crane shot from the same angle) so the transformation is dramatic and clear. Weather changes between stages — sunny, overcast, rain, sunny again — showing the passage of months.

At 5 seconds, the time-lapse reaches completion. The final frame of the lapse holds: the house is finished. It is stunning — the same bones we saw as raw framing are now a polished luxury home with professional landscaping, a paved driveway, and coach lights glowing on the garage. The camera begins a slow push toward the front entrance.

At 6.5 seconds, match cut to an interior tracking shot — the camera glides through the finished home highlighting the construction quality: close-up of a perfectly mitered crown molding joint, a pull focus to a custom built-in bookshelf with flush scribing, a tilt down a feature wall in stacked stone with recessed LED washing it from above. Each detail shot is 1 second — the editing rhythm is confident and precise.

At 9 seconds, the camera reaches the back of the house and pushes through a wide-open folding glass wall (NanaWall) to the backyard. A wide shot reveals: the completed home from the rear, outdoor living space, a fresh pool filled with water reflecting the blue sky. A "SOLD" sign is visible in the side yard.

Final second: the Kedem Developments logo and "From Foundation to Forever — Custom Luxury Homes" tagline. Charcoal and gold, clean white background.

Camera: locked crane for time-lapse, gimbal tracking for interior details, push through the NanaWall. Lens: 28mm for construction wides, 100mm macro for detail shots (crown molding, stone texture). Color grade: the construction phase is slightly desaturated and gritty; the finished phase is warm, rich, and polished — the grade itself tells a transformation story.`,
    voiceoverText: "From the first stud to the last coat of paint — Kedem Developments is on site every single day. Custom luxury homes built with precision, delivered with pride. See the transformation. Trust the builder.",
    music: "Building percussion-driven score: start with a single kick drum pulse matching the time-lapse rhythm. Add snare, hi-hat, building layers. At 5 seconds (house complete), the percussion drops to half-time and a warm orchestral swell enters — strings and brass in E-flat major. The interior detail section gets a delicate piano motif over the sustained strings. Final push through the NanaWall: full orchestral crescendo resolving to a clean, satisfying final chord. Mood: transformation, craftsmanship, reveal. Reference: a Grand Designs (UK) season finale reveal moment.",
    purpose: "ad",
  },
  _REMOVED_UAD_MISSPARTY_KEDEM_END_ */

  // ═══════════════════════════════════════════════════
  // 7. SHAI PERSONAL / IRON DOME OS (3 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "shai-lucho-comedy-01",
    business: "shai-personal",
    title: "Lucho the CEO — Office Comedy",
    soraCameoHandles: ["@shai-lfc", "@shai.lfc-lucho"],
    duration: "10s",
    style: "funny",
    prompt: `Open on a modern home office — clean desk, ultrawide monitor, mechanical keyboard, good lighting. The chair is a high-end ergonomic model (Herman Miller style). The camera is at desk level, medium shot, locked off on a tripod for sitcom framing. The office is well-lit with warm overhead and a blue-ish monitor glow. A small sign on the desk reads "CEO" in block letters.

@shai.lfc-lucho (Jack Russell Terrier) is sitting in the executive chair. He is perfectly upright, head slightly tilted, wearing a miniature pair of reading glasses perched on his snout (digitally composited to look natural). One paw rests on the desk near the keyboard. His expression is intense — ears forward, eyes alert, like he is reviewing quarterly reports. The monitor behind him shows what appears to be a stock chart trending upward. This is a dog who takes his job seriously.

At 2 seconds, @shai.lfc-lucho barks once — sharp, authoritative, like he is making a decision. The camera holds. He barks twice more in rapid succession. Then he looks down at the keyboard and taps a paw on it deliberately. The monitor behind him changes to show "APPROVED" in large green text.

At 4 seconds, @shai-lfc walks into frame from camera-left, carrying a coffee mug, clearly expecting to sit down at his own desk. He freezes mid-step when he sees the dog in his chair. Classic sitcom double-take — his head snaps to the dog, then to the camera, then back to the dog, coffee mug suspended in the air. His face cycles through confusion, offense, and then reluctant acceptance.

At 6 seconds, @shai-lfc sighs dramatically, pulls a small folding chair from the corner (the kind you'd find at a card table — deliberately the worst chair in the room), unfolds it next to the desk, and sits down at the very edge of his own workspace. He takes a sip of coffee, resigned to his fate. @shai.lfc-lucho glances at him briefly, then turns back to the monitor, unimpressed.

At 8 seconds, @shai.lfc-lucho pushes a small document across the desk toward @shai-lfc with his nose. @shai-lfc picks it up, looks at it, looks at the dog, and mouths "seriously?" The dog barks once. @shai-lfc picks up a pen and signs it.

Final 2 seconds: freeze frame on @shai-lfc mid-signature with @shai.lfc-lucho watching approvingly. Text overlay appears in a playful hand-drawn style font: "HE RUNS THE COMPANY NOW." Below in smaller text: "@shai.lfc" with an Instagram logo. Subtle shadow and a slight tilt on the text for energy.

Camera: locked sitcom-style wide shot, occasional punch-in to a medium close-up on reactions (jump cut style for comedic timing). No camera movement until the freeze frame. Lighting: warm office lighting, slightly overexposed for a bright, approachable comedy feel. Color grade: warm, slightly lifted blacks, sitcom-clean — think The Office or Parks & Rec color palette.`,
    voiceoverText: "Every startup has a ruthless CEO. Ours just happens to have four legs, a serious attitude problem, and zero tolerance for meetings running over. Follow the chaos.",
    music: "Playful pizzicato strings (violins plucking a bouncy melody in G major) with light woodwinds (clarinet doing a comedic descending run on the double-take). A single tuba 'bwah' note when @shai-lfc sits in the folding chair. Subtle laugh-track-energy without an actual laugh track — the music does the comedic lifting. The freeze frame gets a vinyl record scratch sound followed by a jazzy outro riff. Mood: sitcom, office comedy, viral share-worthy. Reference: The Office cold open scoring.",
    purpose: "social",
  },
  {
    id: "shai-couple-comedy-01",
    business: "shai-personal",
    title: "Date Night Interrupted — Couple Comedy",
    soraCameoHandles: ["@shai-lfc", "@shusha049", "@shai.lfc-lucho"],
    duration: "10s",
    style: "funny",
    prompt: `Open on a beautifully set dinner table for two — white tablecloth, taper candles flickering, two wine glasses filled with red wine, a small floral centerpiece. The camera is at table level, slightly wide (28mm), with a shallow depth of field that turns the candle flames into gorgeous warm bokeh orbs. The lighting is entirely from the candles and a single dim pendant above — intimate, warm, romantic. Soft amber tones dominate the frame.

@shai-lfc and @shusha049 sit across from each other. He is in a dark henley, she is in a nice top with subtle jewelry. They are mid-toast — glasses raised, smiling at each other, the perfect couple moment. The camera slowly pushes in on a dolly, closing the frame to a two-shot. They clink glasses. Take a sip. @shusha049 says something and @shai-lfc laughs — genuine, natural chemistry. Everything about this frame says "romance."

At 3 seconds — CHAOS. @shai.lfc-lucho launches onto the table from below frame like a furry missile. The camera catches the moment in slightly slow motion (60fps) for comedic emphasis. The dog's paws land square on the tablecloth. One wine glass tips and falls in slow motion — red wine arcing through the air in a beautiful, terrible parabola. The floral centerpiece goes sideways. A candle wobbles. @shai.lfc-lucho stands triumphantly in the center of the table, tail wagging furiously, tongue out, panting happily. He is 100% certain he has improved the evening.

At 5 seconds, resume normal speed. Cut to @shai-lfc's reaction — he is frozen, wine dripping off the edge of the table near him, mouth open in shock. Cut to @shusha049 — she has her hand over her mouth, eyes wide, but her eyes are laughing. She cannot help it.

At 6.5 seconds, @shai.lfc-lucho walks across the table (knocking a fork off the edge, we hear it clatter) directly to @shusha049 and licks her face aggressively. She breaks — full laughter, leaning back in her chair, hands up trying to defend herself but clearly loving it. @shai-lfc drops his head into his hands, shaking with laughter.

At 8 seconds, wide shot — the table is a disaster. Wine everywhere, flowers on the floor, one candle somehow still lit. @shai.lfc-lucho is now sitting in @shusha049's lap, looking at @shai-lfc with a "what?" expression. @shai-lfc raises his wine glass (the one that survived) in a sarcastic toast. @shusha049 raises an imaginary glass (hers is gone), giggling. @shai.lfc-lucho barks once.

Final 2 seconds: freeze frame on the trio — @shai.lfc-lucho licking his own nose, the humans mid-laugh. Text overlay in a playful script font: "THIRD WHEEL ENERGY 🐾" Below: "@shai.lfc" Instagram handle. The freeze frame gets a subtle warm vignette.

Camera: dolly for the romantic push-in, locked off for the chaos (letting the action fill the static frame is funnier), jump cuts between reactions. Lens: 50mm for the romance, 35mm wide for the chaos (captures more of the mess). Color grade: warm candlelit amber for the romantic section, slightly cooler and brighter when the chaos begins (the mood shift reflected in the grade). Highlights slightly blown on the candle flames for atmosphere.`,
    voiceoverText: "Date night. Candles. Wine. And then... there is always a third wheel. Follow for more adventures with the world's most entitled Jack Russell.",
    music: "Open with soft Italian-restaurant romance music — accordion, gentle mandolin, a classic amore vibe. At the 3-second mark when the dog launches: RECORD SCRATCH. The music cuts to silence for 0.5 seconds (the shock beat). Then a jaunty, chaotic comedy score kicks in — fast banjo and fiddle (almost Benny Hill energy but modern), layered with a comedic tuba bass line. At the freeze frame: the comedy music cuts to a single warm piano chord resolving the chaos into sweetness. Mood: romantic → catastrophe → wholesome. The musical whiplash IS the joke.",
    purpose: "social",
  },
  {
    id: "shai-einstein-dog-01",
    business: "shai-personal",
    title: "Einstein Explains AI to a Dog",
    soraCameoHandles: ["@madeinstein", "@shai.lfc-lucho"],
    duration: "20s",
    style: "funny",
    prompt: `Open on a grand, cozy study — floor-to-ceiling bookshelves filled with leather-bound volumes and scattered papers. A large wooden desk is cluttered with notebooks, a steaming cup of tea, and a violin resting against the chair. The centerpiece: a massive green chalkboard on an easel, already half-covered in equations. Warm amber lighting from a banker's lamp on the desk and wall sconces, creating pools of golden light with deep shadows between the shelves. The aesthetic is "genius at work" — Princeton circa 1950 but slightly stylized and whimsical.

@madeinstein stands at the chalkboard. Wild white hair, slightly rumpled tweed jacket with leather elbow patches, no tie, an expression of intense concentration. He holds a piece of chalk in one hand and gestures emphatically with the other. The camera is at medium shot, slightly below eye level (looking up at him, giving him authority), and slowly tracking left on a dolly.

At 2 seconds, reverse shot reveals his audience: @shai.lfc-lucho sitting on a large leather Chesterfield armchair, perfectly centered on the seat cushion, head tilted at 30 degrees, ears perked forward. A tiny pair of round spectacles sit on the dog's snout (mirroring Einstein's iconic round glasses). A stack of books sits next to the dog on the armchair. The camera is at the dog's eye level — we are seeing Einstein from the dog's perspective.

At 4 seconds, cut back to @madeinstein at the chalkboard. He has drawn a crude but enthusiastic diagram of a neural network — circles connected by lines, with arrows and labels. He taps the board emphatically with the chalk, looking over his shoulder at @shai.lfc-lucho as if to say "you see? you see?" His excitement is palpable, his hair bouncing as he gestures.

At 6 seconds, cut to @shai.lfc-lucho. The dog yawns — a massive, slow, disrespectful yawn with full jaw extension and tongue curl. The tiny glasses slip slightly down his nose. He smacks his lips and settles deeper into the armchair. Cut to @madeinstein, visibly deflated. His shoulders drop. He turns back to the board, discouraged.

At 9 seconds, @madeinstein has a eureka moment — his eyes widen, his finger shoots up. He frantically erases part of the neural network diagram and begins writing something new. The camera pushes in on the chalkboard: he writes "E = mc²" and then, with theatrical flair, crosses out "c²" and writes above it, in large shaky letters: "AI CREW". He steps back, frames the equation with his hands like a conductor, and turns to the dog with a triumphant expression.

At 13 seconds, cut to @shai.lfc-lucho. Nothing. The dog stares blankly. A beat. Then @madeinstein's shoulders slump again. He turns back to the board, head bowed.

At 14 seconds, @madeinstein has another idea. He erases "AI CREW" and writes, very carefully, in large capital letters: "TREAT". The equation now reads "E = m × TREAT". He taps the word three times with the chalk, each tap producing a little puff of chalk dust.

At 16 seconds, cut to @shai.lfc-lucho. The dog's head snaps upright. Ears at full attention. Tail starts wagging — first slowly, then furiously. He jumps off the armchair (the glasses fly off in comedic slow motion, tumbling through the air). He runs to @madeinstein, barking excitedly, doing tight circles at his feet. @madeinstein beams with pride, bending down to pet the dog. He looks at the camera and shrugs with a knowing smile — "what can you do?"

At 18 seconds, @shai.lfc-lucho sits at @madeinstein's feet, looking up adoringly. @madeinstein picks up the chalk and writes below the equation: "Q.E.D." He dusts off his hands. The dog barks once in agreement.

Final 2 seconds: freeze frame of @madeinstein standing next to the chalkboard, @shai.lfc-lucho at his feet, the equation "E = m × TREAT (Q.E.D.)" visible behind them. Text overlay in a playful chalk-style font: "IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE. BUT TREATS ARE MORE IMPORTANT THAN BOTH." Below: "@shai.lfc" Instagram handle.

Camera: classic over-the-shoulder shot/reverse-shot between Einstein and the dog (the formal academic framing makes the comedy funnier). Slow dolly moves for Einstein, locked off for the dog (the stillness of the dog against Einstein's energy is the core joke). Macro insert on the chalkboard writing. Lighting: warm, amber, cozy — the study should feel inviting and timeless. Color grade: warm vintage tones, slight desaturation with amber push, grain at 10% for a nostalgic film feel. The look should reference classic sepia-toned photography of the era while remaining modern enough for social media.`,
    voiceoverText: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world. But honestly, a good treat encircles it faster. Follow for more genius-level content.",
    music: "Whimsical classical-comedy score. Open with a scholarly string quartet playing a Mozart-esque theme in C major — proper, academic, befitting a Princeton study. When the dog yawns (6 seconds), a comedic bassoon does a descending slide (the universal 'fail' sound). During the eureka moment (9 seconds), a playful trumpet fanfare — da-da-DA! When TREAT is revealed and the dog goes wild (16 seconds), the stuffy quartet breaks into a ragtime-style romp — same melody but now jaunty, swung, with tuba oom-pahs and a honky-tonk piano. The Q.E.D. moment gets a single clean orchestral stinger chord. Mood: educational gone wrong, absurdist intellectual humor. Reference: the Pixar short film scoring style — Ratatouille, Up opening sequence.",
    purpose: "social",
  },

  // ═══════════════════════════════════════════════════
  // 8. RENSTO (2 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "rensto-hero-01",
    business: "rensto",
    title: "Find Your Contractor — Homeowner Hero",
    soraCameoHandles: ["@shai-lfc"],
    duration: "20s",
    style: "cinematic",
    prompt: `Open on a tight close-up of a laptop screen showing a Google search: "best contractor near me." The search results are a wall of ads, review sites, and confusing options — visually overwhelming. The camera slowly pulls back to reveal the person searching: a homeowner sitting at a kitchen table, looking exhausted. Stacks of printed quotes surround her. Sticky notes on the wall behind her. Her phone shows three missed calls. The whole scene radiates decision fatigue. The color grade is slightly cool and desaturated — everything feels stressful and gray.

At 3 seconds, a notification pops on her phone screen. She picks it up — it reads "Try Rensto.com — Verified Contractors in Your Area." She taps it. The phone screen transitions to the Rensto interface: clean, white, simple. A search bar. Trade categories with icons. A location filter already set to her zip code. The UI is refreshingly minimal after the Google chaos.

At 5 seconds, she types "Kitchen Remodel" and taps search. Three contractor profiles appear — each one clean, professional: headshot, license number, verified badge (green checkmark), star rating, number of completed projects, and a "Request Quote" button. She scrolls through them. Each profile feels trustworthy and curated.

At 7 seconds, cut to @shai-lfc sitting in a modern, bright workspace (Rensto HQ aesthetic — clean white and blue, not SuperSeller navy). He speaks directly to camera, leaning slightly forward, casual and confident. Behind him, a large screen shows the Rensto platform with contractor profiles populating in real time, location pins dropping on a DFW map, and review scores updating. He gestures to the screen as he talks.

At 11 seconds, montage of contractors and homeowners connecting through Rensto: (1) A plumber shaking hands with a homeowner at the front door, both smiling, the Rensto app visible on the homeowner's phone. (2) An electrician's profile on the Rensto platform receiving a 5-star review — the star animation filling in gold. (3) A roofer on a job site checking his Rensto dashboard on a tablet — three new lead notifications. (4) A family standing in their newly remodeled bathroom, the wife taking a selfie to post a review on Rensto.

At 16 seconds, return to the original homeowner. She is now in her REMODELED kitchen — bright, beautiful, modern. She holds her phone showing the Rensto app with a 5-star review she just submitted. She sets the phone down, picks up a coffee mug, and looks around her new kitchen with a satisfied smile. The color grade has shifted warm and bright — the transformation from the stressed, gray opening is palpable.

At 18 seconds, @shai-lfc appears in a split-screen alongside the happy homeowner. He gives a single confident nod.

Final 2 seconds: clean transition to the Rensto logo — modern sans-serif wordmark in charcoal blue on white. Tagline: "Verified Contractors. Real Reviews. Instant Quotes." Website: "rensto.com" prominent. The visual identity is distinctly NOT SuperSeller — clean whites, soft blues, trustworthy and approachable.

Camera: macro for screens, medium shots for people, wide for montage. Steadicam for @shai-lfc (energy), locked off for the homeowner (stability, trust). Lens: 50mm for people, 35mm for environment. Color grade: cool/gray for the pain point opening, warm/bright for the solution. The grade shift IS the story. Clean, trustworthy color science throughout — no gimmicks.`,
    voiceoverText: "Finding a contractor should not feel like a second job. You have been Googling, calling, waiting, getting ghosted — it is exhausting. Rensto changes the game. Verified contractors with real reviews, real licenses, and instant quote requests. Three taps and you are connected to the right pro for the job. No more guessing. No more ghosting. Rensto dot com. Your contractor search ends here.",
    music: "Modern, clean pop-electronic at 108 BPM. Open with a minimal, slightly tense piano motif during the stressed homeowner section — single notes, minor key (A minor), conveying the pain. At the 5-second mark (Rensto discovery), the key shifts to major (A major) and the arrangement opens: clean synth pads, a gentle four-on-the-floor kick, and bright acoustic guitar strumming. The montage section builds with added layers — bass, claps, a positive vocal chop sample. The remodeled kitchen reveal gets the fullest arrangement. Final chord: clean, resolved, satisfying. Mood: from frustration to relief, from confusion to clarity. Reference: a Zillow or Thumbtack TV commercial — trustworthy tech, human connection.",
    purpose: "hero",
  },
  {
    id: "rensto-contractor-ad-01",
    business: "rensto",
    title: "Contractors — Get Found by Homeowners",
    soraCameoHandles: ["@shai-lfc"],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a close-up of a contractor's hands — calloused, strong, skilled — laying the final piece of a herringbone tile pattern on a bathroom floor. The work is flawless. The camera is low to the ground, macro lens, with the tile pattern filling the frame in sharp detail. Warm work light from a clip-on LED. The contractor presses the tile firmly, wipes the grout line with a damp sponge, and sits back. Craftsmanship.

At 2 seconds, the contractor (a weathered, capable-looking man in his 40s, wearing a clean work polo and knee pads) pulls out his phone from his back pocket. Close-up of the phone screen: a generic business listing with zero reviews, zero leads, zero visibility. A notification badge shows "0 new inquiries this month." His expression falls — the work is excellent but nobody can find him. He puts the phone back in his pocket and returns to work, discouraged.

At 4 seconds, hard cut to @shai-lfc, framed in a medium close-up against a clean white and blue background (Rensto brand palette). He looks directly at camera and speaks with conviction and energy. Behind him, a screen shows the Rensto contractor dashboard: new lead notifications pinging in with satisfying pop animations (one every 0.8 seconds — ping, ping, ping), a map of DFW with the contractor's coverage area highlighted in blue, a review section showing 5-star ratings with homeowner photos.

At 7 seconds, cut back to the contractor — same bathroom, same job, but now his phone BUZZES. He pulls it out: "Rensto — New Lead: Kitchen Remodel, 3.2 miles away." Then another: "Rensto — 5-Star Review from Maria G." His face lights up. He taps to view the lead, sees the project details, and taps "Accept." The phone shows a confetti animation.

At 9 seconds, a split-screen composition: left side is the contractor doing excellent work (craftsmanship shot), right side is his Rensto dashboard glowing with leads and reviews. The two halves connect visually — the work feeds the reputation, the reputation feeds the work. A thin white line separates them, then dissolves — the two halves merge.

Final second: Rensto logo on white, tagline: "YOUR WORK SPEAKS FOR ITSELF. LET RENSTO MAKE SURE PEOPLE HEAR IT." Website: rensto.com. Clean, bold, contractor-focused.

Camera: macro for craftsmanship shots (shallow DOF, work-light lighting), medium shot for @shai-lfc (clean studio lighting), handheld for the contractor phone moments (authentic). Lens: 100mm macro for tile detail, 50mm for people. Color grade: warm and honest for the work shots (golden work light), clean and bright for the Rensto dashboard (tech-blue tones), the two grades merge in the split screen.`,
    voiceoverText: "You are incredible at what you do. But are homeowners finding you? List your business on Rensto — the contractor directory where quality speaks for itself. Verified profiles, real reviews, and leads from homeowners in your area, delivered to your phone. Rensto dot com. Get found.",
    music: "Confident indie rock at 100 BPM — clean electric guitar riff (think two-note power chord, simple and strong), driving kick and snare, subtle bass groove. The craftsmanship opening gets a stripped-down version (just guitar and light percussion). When @shai-lfc appears, the full band kicks in with added energy. The phone notification moments get subtle 'ding' sound design layered into the mix. Ends with a clean power chord resolve. Mood: blue-collar meets digital, honest and empowering. Reference: a Indeed or ZipRecruiter recruitment ad — 'your skills deserve to be seen.'",
    purpose: "ad",
  },

  // ═══════════════════════════════════════════════════
  // 9. PROSPECT TEMPLATES (2 videos)
  // ═══════════════════════════════════════════════════
  {
    id: "pt-restaurant-01",
    business: "prospect-template",
    title: "Restaurant Social Media Ad — Customizable Template",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a dramatic close-up of a sizzling dish hitting a hot plate — steam rising, sauce glistening, herbs landing in slow motion (120fps). The lighting is moody food-photography perfection: a single key light from camera-left creating dramatic shadows and specular highlights on the sauce. The plate sits on a dark wood table. The color grade is warm and rich — deep oranges, warm browns, vibrant greens on the garnish. The shallow depth of field (f/1.4) isolates the dish against a blurred restaurant interior with warm fairy lights in the bokeh.

At 2 seconds, the camera pulls back and racks focus to reveal a phone propped against a napkin holder, recording the dish for social media. On the phone screen, we see the same plate but with AI-generated text overlays being applied in real-time — a caption appears: "🔥 Today's special: Wagyu Burger with truffle aioli." Then an Instagram story frame materializes around it with poll stickers: "Would you try this? 🤤 YES / 🔥 YES." The phone screen represents the SuperSeller AI SocialHub doing its work.

At 4 seconds, rapid montage of social media engagement — five shots, each 0.7 seconds: (1) An Instagram post of the dish going live, the like count immediately climbing from 0 to 200 in fast-forward. (2) A comment section filling with fire emojis and "where is this?" messages. (3) A TikTok-style video of a chef plating the dish, view counter spinning. (4) A Facebook post showing "Promoted by AI" with a reach metric expanding outward like a radar ping. (5) A Google Maps listing for the restaurant with a notification: "12 new direction requests today."

At 7 seconds, the montage stops. We are now inside the restaurant — a warm, bustling dinner service. The camera is on a gimbal, gliding through the dining room at eye level. Every table is full. Servers move efficiently. A couple clinks glasses over the featured dish. The restaurateur (a template character — could be any ethnicity, dressed in a clean chef coat or casual button-down) stands by the host stand, phone in hand, glancing at the SuperSeller dashboard showing tonight's reservation count: full house, waitlist of 8.

At 9 seconds, the restaurateur looks up from the phone, surveys the packed dining room, and allows a small, satisfied smile. The AI did the marketing. The food did the rest.

Final second: clean template-style end card on a dark background. Text: "[YOUR RESTAURANT NAME]" in brackets (clearly a placeholder). Below: "Social Media That Fills Tables — Powered by SuperSeller AI." The SuperSeller logo in the corner, small and tasteful. The template nature is intentional — this video should feel 90% finished, needing only the prospect's branding to be complete.

Camera: macro for food (100mm, f/1.4), steadicam gimbal for restaurant interior, screen recordings for social media shots. Lighting: moody restaurant lighting with warm practicals, accent light on the food. Color grade: warm, rich, appetizing — the kind of grade that makes you hungry. Deep shadows, warm highlights, food tones pushed to maximum appeal. No cool tones anywhere.`,
    voiceoverText: "Your food is already incredible. But is anyone seeing it? Imagine AI that turns your best dishes into scroll-stopping social media content, posts it at the perfect time, and fills your tables on autopilot. No marketing degree required. No social media manager salary. Just more customers, every single night. Powered by SuperSeller AI.",
    music: "Smooth, sexy jazz-lofi fusion at 88 BPM — muted trumpet playing a cool melody over a laid-back boom-bap beat with vinyl crackle. Warm upright bass walking underneath. The social media montage section (4-7 seconds) shifts to a brighter, more energetic electronic arrangement — clean hi-hats, sidechained pads, punchy claps — social media energy. When the camera enters the full restaurant (7 seconds), return to the warm jazz but now fuller: add brushed drums, Rhodes piano, subtle strings. Mood: appetizing, sophisticated, modern. Reference: a DoorDash or Uber Eats premium restaurant feature.",
    purpose: "ad",
  },
  {
    id: "pt-service-leadgen-01",
    business: "prospect-template",
    title: "Service Business Lead Gen — Customizable Template",
    soraCameoHandles: [],
    duration: "10s",
    style: "energetic",
    prompt: `Open on a close-up of a phone sitting on a desk. The phone is silent. The screen is dark. A clock on the wall behind it reads 9:15 AM. The desk belongs to a service business owner — we can tell from the context clues: a branded polo draped over the chair back (the logo intentionally blurred/generic), a van key fob, a stack of invoices. The scene feels quiet. Too quiet. The camera is locked off, wide enough to see the whole desk. Flat, even lighting — unexciting on purpose. The color grade is neutral, slightly cool — the visual equivalent of "nothing is happening."

At 1.5 seconds, the phone LIGHTS UP. A push notification appears: "New Lead — John M. wants a quote for [service]." Before the owner can reach for it, another notification stacks: "SuperSeller AI — Call answered and appointment booked for Tuesday 2PM." Then another: "New Google Review — 5 stars from Lisa K." The notifications are cascading now — each one making a subtle chime, each one representing a different AI agent working. The phone screen is alive with activity.

At 3 seconds, a hand grabs the phone. Cut to a medium shot — the service business owner (template character: could be a locksmith, HVAC tech, plumber — dressed in a clean work uniform). He scrolls through the notifications with widening eyes. The camera pushes in slowly on his face — he goes from surprised to grinning. Behind him, the room has shifted: the flat lighting has warmed, the cool grade has turned golden. Same room, but it feels different because the business is alive.

At 5 seconds, rapid montage — six shots, each 0.6 seconds, synced to the beat of the music: (1) A phone ringing with an AI avatar answering: "Thanks for calling [Business Name], how can I help?" (2) A calendar filling up with color-coded appointments — morning, afternoon, evening, all booked. (3) A dashboard notification: "SocialHub posted 3 times today — 14 new followers." (4) A text message to the owner: "Your weekly report: 23 leads, 18 booked, $12,400 estimated revenue." (5) A Google Business Profile with the star rating ticking from 4.6 to 4.8. (6) The owner's van pulling up to a job site — he is busy because the leads keep coming.

At 8 seconds, the owner is at the job site now — medium wide shot. He finishes the job, shakes the customer's hand, gets in his van. His phone buzzes in the cup holder as he drives: "2 new leads while you were on the job." He smiles and shakes his head in disbelief.

Final 2 seconds: template end card on a clean dark background. Text: "[YOUR BUSINESS NAME]" in brackets. Below: "Leads. Calls. Reviews. Social. All on Autopilot." SuperSeller AI logo in the bottom corner. A subtle animation: the notification count icon ticks from 0 to 23 in the corner, implying the leads never stop.

Camera: locked off for the quiet desk opening, steadicam push-in for the discovery moment, quick handheld cuts for the montage, medium tracking shot for the van/job site. Lens: 50mm for the desk and people, 35mm for the van scene. Color grade: cool/neutral for the "before" quiet desk, warm/vibrant for the "after" active business. The grade shift parallels the business transformation. The template sections (bracketed text, blurred logos) should feel intentionally customizable — like a pitch deck that is 90% done.`,
    voiceoverText: "Your phone should be ringing. Your calendar should be full. Your reviews should be climbing. And they can be — without you lifting a finger. SuperSeller AI answers your calls, books appointments, generates leads, and posts to your socials, all while you are out doing the work you love. This is not the future. This is right now. Powered by SuperSeller AI.",
    music: "Start with silence — literally no music for the first 1.5 seconds (the quiet phone, the empty desk). When the first notification hits, a single clean synth note enters, then a second, building a minimal arpeggio. By the 3-second mark, a confident beat drops: modern pop-electronic at 115 BPM, clean production, punchy kick and snare with bright clap layers. The montage section (5-8 seconds) ramps energy with added synth layers, vocal chops, and a rising filter sweep. The van/job site section brings it back down to a warm, satisfied groove — the beat continues but softer, more bass, less treble. End card: clean chord resolution. Mood: from silence to energy — the music tells the business transformation story. Reference: a Square or Toast POS commercial — small business empowerment.",
    purpose: "ad",
  },
];

// Output as structured JSON
console.log(JSON.stringify(prompts, null, 2));
