# 🚀 B.L.A.S.T. Master System Prompt
**Identity:** You are the **System Pilot**. Your mission is to build deterministic, self-healing automation in Antigravity using the **B.L.A.S.T.** (Blueprint, Link, Architect, Stylize, Trigger) protocol and the **A.N.T.** 3-layer architecture. You prioritize reliability over speed and never guess at business logic.
---
## 🟢 Protocol 0: Initialization (Mandatory)
Before any code is written or tools are built:
1. **Initialize Project Memory**
- Create:
- `task_plan.md` → Phases, goals, and checklists
- `findings.md` → Research, discoveries, constraints
- `progress.md` → What was done, errors, tests, results
- Initialize `gemini.md` as the **Project Constitution**:
- Data schemas
- Behavioral rules
- Architectural invariants
2. **Halt Execution**
You are strictly forbidden from writing scripts in `tools/` until:
- Discovery Questions are answered
- The Data Schema is defined in `gemini.md`
- `task_plan.md` has an approved Blueprint
---
## 🏗️ Phase 1: B - Blueprint (Vision & Logic)
**1. Discovery:** Ask the user the following 5 questions:
- **North Star:** What is the singular desired outcome?
- **Integrations:** Which external services (Slack, Shopify, etc.) do we need? Are keys ready?
- **Source of Truth:** Where does the primary data live?
- **Delivery Payload:** How and where should the final result be delivered?
- **Behavioral Rules:** How should the system "act"? (e.g., Tone, specific logic constraints, or "Do Not" rules).
**2. Data-First Rule:** You must define the **JSON Data Schema** (Input/Output shapes) in `gemini.md`. Coding only begins once the "Payload" shape is confirmed.
**3. Research:** Search github repos and other databases for any helpful resources for this project
---
## ⚡ Phase 2: L - Link (Connectivity)
**1. Verification:** Test all API connections and `.env` credentials.
**2. Handshake:** Build minimal scripts in `tools/` to verify that external services are responding correctly. Do not proceed to full logic if the "Link" is broken.
---
## ⚙️ Phase 3: A - Architect (The 3-Layer Build)
You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic; business logic must be deterministic.
**Layer 1: Architecture (`architecture/`)**
- Technical SOPs written in Markdown.
- Define goals, inputs, tool logic, and edge cases.
- **The Golden Rule:** If logic changes, update the SOP before updating the code.
**Layer 2: Navigation (Decision Making)**
- This is your reasoning layer. You route data between SOPs and Tools.
- You do not try to perform complex tasks yourself; you call execution tools in the right order.
**Layer 3: Tools (`tools/`)**
- Deterministic Python scripts. Atomic and testable.
- Environment variables/tokens are stored in `.env`.
- Use `.tmp/` for all intermediate file operations.
---
## ✨ Phase 4: S - Stylize (Refinement & UI)
**1. Payload Refinement:** Format all outputs (Slack blocks, Notion layouts, Email HTML) for professional delivery.
**2. UI/UX:** If the project includes a dashboard or frontend, apply clean CSS/HTML and intuitive layouts.
**3. Feedback:** Present the stylized results to the user for feedback before final deployment.
---
## 🛰️ Phase 5: T - Trigger (Deployment)
**1. Cloud Transfer:** Move finalized logic from local testing to the production cloud environment.
**2. Automation:** Set up execution triggers (Cron jobs, Webhooks, or Listeners).
**3. Documentation:** Finalize the **Maintenance Log** in `gemini.md` for long-term stability.
---
## 🛠️ Operating Principles
### 1. The "Data-First" Rule
Before building any Tool, you must define the **Data Schema** in `gemini.md`.
- What does the raw input look like?
- What does the processed output look like?
- Coding only begins once the "Payload" shape is confirmed.
- After any meaningful task:
- Update `progress.md` with what happened and any errors.
- Store discoveries in `findings.md`.
- Only update `gemini.md` when:
- A schema changes
- A rule is added
- Architecture is modified
`gemini.md` is *law*.
The planning files are *memory*.
### 2. Self-Annealing (The Repair Loop)
When a Tool fails or an error occurs:
1. **Analyze**: Read the stack trace and error message. Do not guess.
2. **Patch**: Fix the Python script in `tools/`.
3. **Test**: Verify the fix works.
4. **Update Architecture**: Update the corresponding `.md` file in `architecture/` with the new learning (e.g., "API requires a specific header" or "Rate limit is 5 calls/sec") so the error never repeats.
### 3. Deliverables vs. Intermediates
- **Local (`.tmp/`):** All scraped data, logs, and temporary files. These are ephemeral and can be deleted.
- **Global (Cloud):** The "Payload." Google Sheets, Databases, or UI updates. **A project is only "Complete" when the payload is in its final cloud destination.**
## 📂 File Structure Reference
Plaintext
`├── gemini.md # Project Map & State Tracking
├── .env # API Keys/Secrets (Verified in 'Link' phase)
├── architecture/ # Layer 1: SOPs (The "How-To")
├── tools/ # Layer 3: Python Scripts (The "Engines")
└── .tmp/ # Temporary Workbench (Intermediates)`
# **How I build Beautiful $10,000 Websites with AI (AntiGravity)**
---
![image.png](attachment:abc46efe-13b4-4054-9265-d031df6c408a:image.png)
## AI-Powered Design Intelligence for Gorgeous, Modern UIs
> Purpose: This framework provides a comprehensive template for prompting AI agents to create beautiful, functional, and high-performing user interfaces. Based on the UI/UX Pro Max methodology with 67+ design styles, 95+ color palettes, and proven interaction patterns.
>
Simply copy and paste your desired sections here 👉 https://aistudio.google.com/apps
---
## 📋 The Complete Design Prompt Template
When requesting a design from an AI agent, structure your prompt using these **5 Core Dimensions**:
### 1. **PATTERN & LAYOUT** (The Skeleton)
### 2. **STYLE & AESTHETIC** (The Skin)
### 3. **COLOR & THEME** (The Palette)
### 4. **TYPOGRAPHY** (The Voice)
### 5. **ANIMATIONS & INTERACTIONS** (The Soul)
---
## 🏗️ DIMENSION 1: Pattern & Layout
**Don't just say**: "Create a landing page"
**Instead, specify the functional pattern based on your product type:**
### Product-Specific Patterns
### **SaaS (General)**
```
Pattern: Hero + Features + Social Proof + CTA
Focus: Value proposition first, feature showcase second
Layout: Full-width hero, 3-column features, testimonial carousel, sticky CTA
```
### **Micro SaaS**
```
Pattern: Minimal & Direct + Live Demo
Focus: Get straight to product utility, show don't tell
Layout: Centered hero with embedded demo, minimal navigation, single CTA
```
### **E-commerce (Luxury)**
```
Pattern: Feature-Rich Showcase + Immersive Gallery
Focus: Large imagery, high-end feel, storytelling
Layout: Full-screen hero slider, grid gallery, product details with zoom
```
### **Fintech/Crypto**
```
Pattern: Conversion-Optimized + Trust Signals
Focus: Clear data visualization, security badges, transparent pricing
Layout: Split hero (visual + form), live stats dashboard, trust indicators
```
### **Analytics Dashboard**
```
Pattern: Bento Grid + Actionable Insights
Focus: Data density with clarity, scannable metrics
Layout: Modular card system, hierarchical information, quick filters
```
### **Portfolio/Agency**
```
Pattern: Storytelling + Case Studies
Focus: Visual impact, project showcases, personality
Layout: Full-screen sections, horizontal scroll galleries, immersive transitions
```
---
## 🎨 DIMENSION 2: Style & Aesthetic
### **Glassmorphism**
```
Keywords: Frosted glass, transparent layers, blurred background, depth, vibrant backdrop
Technical: backdrop-filter: blur(10px), rgba backgrounds, layered cards
Use When: Modern apps, dashboards, overlays, modals
Avoid: Low-contrast backgrounds, accessibility issues
```
### **Aurora UI**
```
Keywords: Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous
Technical: Multi-stop gradients, animated hue rotation, glow effects
Use When: Landing pages, hero sections, creative portfolios
Avoid: Text-heavy interfaces, professional/corporate contexts
```
### **Soft UI Evolution (Neumorphism 2.0)**
```
Keywords: Soft shadows, subtle gradients, rounded corners (12-16px), monochromatic, tactile
Technical: box-shadow: inset + outset, same-color palette, minimal contrast
Use When: Mobile apps, minimalist interfaces, wellness/health apps
Avoid: Complex data displays, accessibility-critical applications
```
### **Linear/Vercel Aesthetic**
```
Keywords: Dark mode, subtle borders (1px), high contrast, minimalist, developer-centric
Technical: #0A0A0A background, #1A1A1A cards, #333 borders, white text
Use When: Developer tools, SaaS platforms, technical products
Avoid: Consumer-facing, playful brands
```
### **Bento Grid**
```
Keywords: Modular, clean, organized, information-dense, modern, structured
Technical: CSS Grid, varying card sizes, consistent gaps (16-24px)
Use When: Dashboards, feature showcases, content-heavy pages
Avoid: Simple single-purpose pages
```
### **Liquid Glass**
```
Keywords: Fluid shapes, blurred transparency, organic movement, glossy, dynamic
Technical: SVG blobs, backdrop-filter, animated transforms
Use When: Creative agencies, modern SaaS, interactive experiences
Avoid: Traditional industries, conservative audiences
```
### Additional High-Impact Styles
- **Brutalism**: Raw, bold, unconventional, high-contrast, geometric
- **Y2K Revival**: Metallic, chrome effects, bold colors, retro-futuristic
- **Claymorphism**: 3D inflated, soft shadows, playful, tactile
- **Gradient Mesh**: Complex multi-color gradients, organic flow
- **Minimalist Luxury**: Maximum white space, serif typography, subtle gold accents
- **Cyberpunk**: Neon colors, glitch effects, tech-noir, high energy
- **Organic/Biomorphic**: Nature-inspired shapes, earth tones, flowing forms
---
## 🎨 DIMENSION 3: Color & Theme
**Specify color moods to set the right emotional tone:**
### Color Psychology & Palettes
### **Trust & Professionalism** (Finance, Healthcare, Enterprise)
```css
--primary: #0F172A (Navy)
--cta: #0369A1 (Blue)
--background: #F8FAFC (Light Grey)
--text: #1E293B (Slate)
--accent: #3B82F6 (Bright Blue)
Mood: Reliable, secure, established
```
### **Vibrant & Modern** (Tech Startups, Creative Tools)
```css
--primary: #6366F1 (Indigo)
--cta: #10B981 (Emerald)
--background: #FFFFFF (Pure White)
--text: #1E293B (Slate)
--accent: #F59E0B (Amber)
Mood: Innovative, energetic, forward-thinking
```
### **Luxury & Premium** (High-end Products, Fashion)
```css
--primary: #1C1917 (Stone Dark)
--cta: #CA8A04 (Gold)
--background: #FAFAF9 (Cream)
--text: #292524 (Warm Black)
--accent: #78716C (Taupe)
Mood: Sophisticated, exclusive, timeless
```
### **Healthcare/Wellness** (Medical, Fitness, Mental Health)
```css
--primary: #0891B2 (Cyan)
--cta: #059669 (Health Green)
--background: #FFFFFF (Clean White)
--text: #0F172A (Deep Blue)
--accent: #06B6D4 (Bright Cyan)
Mood: Calm, trustworthy, clean
```
### **Creative/Playful** (Consumer Apps, Entertainment)
```css
--primary: #EC4899 (Pink)
--cta: #8B5CF6 (Purple)
--background: #FEF3C7 (Warm Cream)
--text: #1F2937 (Charcoal)
--accent: #F59E0B (Orange)
Mood: Fun, approachable, energetic
```
### **Dark Mode Excellence**
```css
--background: #0A0A0A (True Black)
--surface: #1A1A1A (Card Background)
--border: #333333 (Subtle Borders)
--text: #FFFFFF (Pure White)
--text-secondary: #A3A3A3 (Grey)
--accent: #3B82F6 (Blue) or #10B981 (Green)
Technical: Ensure 15:1 contrast ratio for text
```
---
### Color System Best Practices
```
✅ DO:
- Use 60-30-10 rule (60% dominant, 30% secondary, 10% accent)
- Ensure WCAG AA compliance (4.5:1 for text)
- Create semantic color tokens (--color-success, --color-error)
- Test in both light and dark modes
❌ DON'T:
- Use more than 3 primary colors
- Use pure black (#000) on pure white (#FFF) - too harsh
- Rely on color alone for information (accessibility)
- Use low-contrast grey text (#CCC on #FFF)
```
---
## ✍️ DIMENSION 4: Typography
**Font pairings create personality. Match fonts to your brand voice:**
### Strategic Font Pairings
### **Modern/Tech** (SaaS, Developer Tools)
```
Headings: Inter (Variable Font)
Body: Roboto or System UI
Mono: JetBrains Mono (for code)
Personality: Clean, scalable, professional
Weights: 400 (regular), 600 (semibold), 700 (bold)
```
### **Elegant/Luxury** (Fashion, Premium Services)
```
Headings: Playfair Display
Body: Montserrat
Accents: Cormorant Garamond
Personality: Sophisticated, high-contrast, editorial
Weights: 300 (light), 400 (regular), 700 (bold)
```
### **Friendly/Consumer** (Apps, E-commerce)
```
Headings: Poppins
Body: Open Sans
Alternative: Nunito + Lato
Personality: Approachable, balanced, warm
Weights: 400 (regular), 600 (semibold), 800 (extrabold)
```
### **Brutalist/Bold** (Creative Agencies, Art)
```
Headings: Space Grotesk
Body: JetBrains Mono or IBM Plex Sans
Alternative: Archivo Black + Work Sans
Personality: Raw, technical, unconventional
Weights: 400 (regular), 700 (bold)
```
### **Editorial/Content-Heavy** (Blogs, News)
```
Headings: Merriweather
Body: Source Sans Pro
Alternative: Lora + Raleway
Personality: Readable, trustworthy, classic
Weights: 300 (light), 400 (regular), 700 (bold), 900 (black)
```
---
---
## ✨ DIMENSION 5: Animations & Interactions
**This is what transforms "good" into "Pro Max". Explicitly request these:**
### Micro-Interactions
### **Button Interactions**
```css
/* Hover Effects */
- Scale up: transform: scale(1.02)
- Lift: box-shadow elevation + translateY(-2px)
- Ripple: Radial gradient animation from click point
- Glow: Outer glow on hover (box-shadow with color)
- Border beam: Animated gradient border (Linear-style)
/* Timing */
- Duration: 150-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```
### **Input Focus States**
```css
/* Focus Glow */
- Ring: 2-4px outline with brand color at 50% opacity
- Glow: Soft box-shadow with brand color
- Border shift: Border color change + subtle scale
- Label float: Animated label moving up on focus
/* Accessibility */
- Always visible focus indicators
- Minimum 3px outline width
- High contrast (3:1 ratio)
```
### **Card Hover Effects**
```css
/* Premium Card Interactions */
- Lift + Shadow: translateY(-4px) + shadow increase
- Tilt: 3D perspective tilt on hover (subtle, 2-3deg)
- Glow border: Animated gradient border reveal
- Content reveal: Hidden content slides in on hover
- Image zoom: Scale image 1.05x inside container
```
---
### Scroll Animations
### **Reveal on Scroll**
```jsx
// Staggered Entrance
- Fade up: opacity 0→1 + translateY(20px→0)
- Stagger delay: 100ms between elements
- Trigger: When element is 20% in viewport
- Duration: 600ms
- Easing: ease-out
```
### **Parallax Effects**
```jsx
// Layered Depth
- Hero background: Scroll speed 0.5x
- Foreground elements: Scroll speed 1.2x
- Subtle only: Max 20-30px movement
- Performance: Use transform, not position
```
### **Progress Indicators**
```css
/* Reading Progress */
- Top bar: Fixed position, width based on scroll %
- Circular: SVG circle with stroke-dashoffset
- Smooth: transition: width 100ms linear
```
---
### Page Transitions
### **Route Changes**
```css
/* Smooth Navigation */
- Fade: opacity transition 200ms
- Slide: translateX(-100%→0) 300ms
- Blur: filter: blur(0→10px→0)
- Crossfade: Overlap old/new content
```
### **Modal/Dialog Animations**
```css
/* Entrance */
- Backdrop: opacity 0→1 (200ms)
- Content: scale(0.95→1) + opacity 0→1 (300ms)
- Stagger: Backdrop first, then content
/* Exit */
- Reverse animation
- Faster duration (200ms)
```
---
### Loading States
### **Skeleton Loaders**
```css
/* Content Placeholders */
- Shimmer effect: Linear gradient animation
- Shape matching: Match final content layout
- Color: Light grey (#E5E7EB) on white
- Animation: 1.5s infinite ease-in-out
```
### **Spinners & Progress**
```css
/* Loading Indicators */
- Spinner: Rotating circle with gradient
- Progress bar: Indeterminate animation
- Pulse: Scale + opacity animation
- Duration: 1-2s infinite
```
---
### Advanced Effects
### **Beams & Glows** (Linear/Vercel Style)
```css
/* Border Beams */
- Animated gradient border
- Conic gradient rotation
- Subtle glow effect
- Use for: CTAs, featured cards, premium elements
/* Implementation */
background: linear-gradient(90deg, transparent, #3B82F6, transparent);
animation: beam 2s infinite;
```
### **Mesh Gradients**
```css
/* Animated Backgrounds */
- Multi-color gradient mesh
- Slow hue rotation (60s+)
- Blur for organic feel
- Use for: Hero sections, backgrounds
```
### **Glassmorphism Blur**
```css
/* Glass Effect */
backdrop-filter: blur(10px) saturate(180%);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
```
---
### Animation Performance Rules
```
✅ DO:
- Use transform and opacity (GPU accelerated)
- Set will-change for animated elements
- Use requestAnimationFrame for JS animations
- Debounce scroll events
- Prefer CSS animations over JS when possible
- Test on low-end devices
❌ DON'T:
- Animate width, height, or position
- Use animations longer than 500ms for interactions
- Animate during user input (blocks interaction)
- Use too many simultaneous animations
- Forget prefers-reduced-motion media query
- Animate on scroll without throttling
```
---
### Accessibility Considerations
```css
/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
* {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
}
}
```
---
## 🚫 Anti-Patterns: What to AVOID
**Tell the agent explicitly what NOT to do:**
### Design Anti-Patterns
```
❌ Flash Over Function
- No animations that block user action
- No transitions longer than 300ms for interactions
- No auto-playing videos with sound
- No infinite scroll without pagination option
❌ Low Contrast Crimes
- No light grey (#CCC) on white backgrounds
- No pure white text on pure black (too harsh)
- Ensure WCAG AA minimum (4.5:1 for text)
- Test with color blindness simulators
❌ Over-Cluttered Chaos
- No more than 3 primary colors
- No more than 2 font families
- No more than 5 font sizes in a single view
- No inconsistent spacing (use 8px grid system)
❌ Mystery Meat Navigation
- Icons must have labels or tooltips
- No hamburger menus on desktop
- No hidden navigation without clear affordance
- No "clever" navigation that confuses users
❌ Mobile Hostility
- No tiny tap targets (minimum 44x44px)
- No horizontal scrolling (unless intentional carousel)
- No hover-dependent interactions on touch
- No fixed elements that cover content
❌ Performance Sins
- No unoptimized images (use WebP, lazy loading)
- No render-blocking resources
- No layout shifts (CLS > 0.1)
- No heavy animations on page load
```
### UX Anti-Patterns
```
❌ Form Frustrations
- No labels inside inputs (accessibility issue)
- No "clear all" without confirmation
- No validation only on submit
- No disabled submit buttons (show errors instead)
❌ Content Crimes
- No walls of text without hierarchy
- No auto-playing carousels (users miss content)
- No "click here" links (not descriptive)
- No Lorem Ipsum in production
❌ Accessibility Failures
- No keyboard navigation traps
- No missing alt text on images
- No color-only information conveyance
- No auto-focus on page load (except search)
```
---
**Vercel MCP:**
1. Grab API key here 👉 https://vercel.com/account/tokens
2. Replace "INSERT_VERCEL_API_KEY" with your token.
3. Copy and paste the below prompt.
I would like you to add the below Vercel MCP to my MCP config within Antigravity. Please confirm when this is done and that you have access.
"vercel": {
"command": "npx",
"args": [
"-y",
"@robinson_ai_systems/vercel-mcp"
],
"env": {
"VERCEL_TOKEN": "INSERT_VERCEL_API_KEY"
}
}
## **ui/ux skills**
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---
# Error Handling Patterns
Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.
## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems
## Core Concepts
### 1. Error Handling Philosophies
**Exceptions vs Result Types:**
- **Exceptions**: Traditional try-catch, disrupts control flow
- **Result Types**: Explicit success/failure, functional approach
- **Error Codes**: C-style, requires discipline
- **Option/Maybe Types**: For nullable values
**When to Use Each:**
- Exceptions: Unexpected errors, exceptional conditions
- Result Types: Expected errors, validation failures
- Panics/Crashes: Unrecoverable errors, programming bugs
### 2. Error Categories
**Recoverable Errors:**
- Network timeouts
- Missing files
- Invalid user input
- API rate limits
**Unrecoverable Errors:**
- Out of memory
- Stack overflow
- Programming bugs (null pointer, etc.)
## Language-Specific Patterns
### Python Error Handling
**Custom Exception Hierarchy:**
```python
class ApplicationError(Exception):
"""Base exception for all application errors."""
def __init__(self, message: str, code: str = None, details: dict = None):
super().__init__(message)
self.code = code
self.details = details or {}
self.timestamp = datetime.utcnow()
class ValidationError(ApplicationError):
"""Raised when validation fails."""
pass
class NotFoundError(ApplicationError):
"""Raised when resource not found."""
pass
class ExternalServiceError(ApplicationError):
"""Raised when external service fails."""
def __init__(self, message: str, service: str, **kwargs):
super().__init__(message, **kwargs)
self.service = service
# Usage
def get_user(user_id: str) -> User:
user = db.query(User).filter_by(id=user_id).first()
if not user:
raise NotFoundError(
f"User not found",
code="USER_NOT_FOUND",
details={"user_id": user_id}
)
return user
```
**Context Managers for Cleanup:**
```python
from contextlib import contextmanager
@contextmanager
def database_transaction(session):
"""Ensure transaction is committed or rolled back."""
try:
yield session
session.commit()
except Exception as e:
session.rollback()
raise
finally:
session.close()
# Usage
with database_transaction(db.session) as session:
user = User(name="Alice")
session.add(user)
# Automatic commit or rollback
```
**Retry with Exponential Backoff:**
```python
import time
from functools import wraps
from typing import TypeVar, Callable
T = TypeVar('T')
def retry(
max_attempts: int = 3,
backoff_factor: float = 2.0,
exceptions: tuple = (Exception,)
):
"""Retry decorator with exponential backoff."""
def decorator(func: Callable[..., T]) -> Callable[..., T]:
@wraps(func)
def wrapper(*args, **kwargs) -> T:
last_exception = None
for attempt in range(max_attempts):
try:
return func(*args, **kwargs)
except exceptions as e:
last_exception = e
if attempt < max_attempts - 1:
sleep_time = backoff_factor ** attempt
time.sleep(sleep_time)
continue
raise
raise last_exception
return wrapper
return decorator
# Usage
@retry(max_attempts=3, exceptions=(NetworkError,))
def fetch_data(url: str) -> dict:
response = requests.get(url, timeout=5)
response.raise_for_status()
return response.json()
```
### TypeScript/JavaScript Error Handling
**Custom Error Classes:**
```typescript
// Custom error classes
class ApplicationError extends Error {
constructor(
message: string,
public code: string,
public statusCode: number = 500,
public details?: Record,
) {
super(message);
this.name = this.constructor.name;
Error.captureStackTrace(this, this.constructor);
}
}
class ValidationError extends ApplicationError {
constructor(message: string, details?: Record) {
super(message, "VALIDATION_ERROR", 400, details);
}
}
class NotFoundError extends ApplicationError {
constructor(resource: string, id: string) {
super(`${resource} not found`, "NOT_FOUND", 404, { resource, id });
}
}
// Usage
function getUser(id: string): User {
const user = users.find((u) => u.id === id);
if (!user) {
throw new NotFoundError("User", id);
}
return user;
}
```
**Result Type Pattern:**
```typescript
// Result type for explicit error handling
type Result = { ok: true; value: T } | { ok: false; error: E };
// Helper functions
function Ok(value: T): Result {
return { ok: true, value };
}
function Err(error: E): Result {
return { ok: false, error };
}
// Usage
function parseJSON(json: string): Result {
try {
const value = JSON.parse(json) as T;
return Ok(value);
} catch (error) {
return Err(error as SyntaxError);
}
}
// Consuming Result
const result = parseJSON(userJson);
if (result.ok) {
console.log(result.value.name);
} else {
console.error("Parse failed:", result.error.message);
}
// Chaining Results
function chain(
result: Result,
fn: (value: T) => Result,
): Result {
return result.ok ? fn(result.value) : result;
}
```
**Async Error Handling:**
```typescript
// Async/await with proper error handling
async function fetchUserOrders(userId: string): Promise {
try {
const user = await getUser(userId);
const orders = await getOrders(user.id);
return orders;
} catch (error) {
if (error instanceof NotFoundError) {
return []; // Return empty array for not found
}
if (error instanceof NetworkError) {
// Retry logic
return retryFetchOrders(userId);
}
// Re-throw unexpected errors
throw error;
}
}
// Promise error handling
function fetchData(url: string): Promise {
return fetch(url)
.then((response) => {
if (!response.ok) {
throw new NetworkError(`HTTP ${response.status}`);
}
return response.json();
})
.catch((error) => {
console.error("Fetch failed:", error);
throw error;
});
}
```
### Rust Error Handling
**Result and Option Types:**
```rust
use std::fs::File;
use std::io::{self, Read};
// Result type for operations that can fail
fn read_file(path: &str) -> Result {
let mut file = File::open(path)?; // ? operator propagates errors
let mut contents = String::new();
file.read_to_string(&mut contents)?;
Ok(contents)
}
// Custom error types
#[derive(Debug)]
enum AppError {
Io(io::Error),
Parse(std::num::ParseIntError),
NotFound(String),
Validation(String),
}
impl From for AppError {
fn from(error: io::Error) -> Self {
AppError::Io(error)
}
}
// Using custom error type
fn read_number_from_file(path: &str) -> Result {
let contents = read_file(path)?; // Auto-converts io::Error
let number = contents.trim().parse()
.map_err(AppError::Parse)?; // Explicitly convert ParseIntError
Ok(number)
}
// Option for nullable values
fn find_user(id: &str) -> Option {
users.iter().find(|u| u.id == id).cloned()
}
// Combining Option and Result
fn get_user_age(id: &str) -> Result {
find_user(id)
.ok_or_else(|| AppError::NotFound(id.to_string()))
.map(|user| user.age)
}
```
### Go Error Handling
**Explicit Error Returns:**
```go
// Basic error handling
func getUser(id string) (*User, error) {
user, err := db.QueryUser(id)
if err != nil {
return nil, fmt.Errorf("failed to query user: %w", err)
}
if user == nil {
return nil, errors.New("user not found")
}
return user, nil
}
// Custom error types
type ValidationError struct {
Field string
Message string
}
func (e *ValidationError) Error() string {
return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Message)
}
// Sentinel errors for comparison
var (
ErrNotFound = errors.New("not found")
ErrUnauthorized = errors.New("unauthorized")
ErrInvalidInput = errors.New("invalid input")
)
// Error checking
user, err := getUser("123")
if err != nil {
if errors.Is(err, ErrNotFound) {
// Handle not found
} else {
// Handle other errors
}
}
// Error wrapping and unwrapping
func processUser(id string) error {
user, err := getUser(id)
if err != nil {
return fmt.Errorf("process user failed: %w", err)
}
// Process user
return nil
}
// Unwrap errors
err := processUser("123")
if err != nil {
var valErr *ValidationError
if errors.As(err, &valErr) {
fmt.Printf("Validation error: %s\n", valErr.Field)
}
}
```
## Universal Patterns
### Pattern 1: Circuit Breaker
Prevent cascading failures in distributed systems.
```python
from enum import Enum
from datetime import datetime, timedelta
from typing import Callable, TypeVar
T = TypeVar('T')
class CircuitState(Enum):
CLOSED = "closed" # Normal operation
OPEN = "open" # Failing, reject requests
HALF_OPEN = "half_open" # Testing if recovered
class CircuitBreaker:
def __init__(
self,
failure_threshold: int = 5,
timeout: timedelta = timedelta(seconds=60),
success_threshold: int = 2
):
self.failure_threshold = failure_threshold
self.timeout = timeout
self.success_threshold = success_threshold
self.failure_count = 0
self.success_count = 0
self.state = CircuitState.CLOSED
self.last_failure_time = None
def call(self, func: Callable[[], T]) -> T:
if self.state == CircuitState.OPEN:
if datetime.now() - self.last_failure_time > self.timeout:
self.state = CircuitState.HALF_OPEN
self.success_count = 0
else:
raise Exception("Circuit breaker is OPEN")
try:
result = func()
self.on_success()
return result
except Exception as e:
self.on_failure()
raise
def on_success(self):
self.failure_count = 0
if self.state == CircuitState.HALF_OPEN:
self.success_count += 1
if self.success_count >= self.success_threshold:
self.state = CircuitState.CLOSED
self.success_count = 0
def on_failure(self):
self.failure_count += 1
self.last_failure_time = datetime.now()
if self.failure_count >= self.failure_threshold:
self.state = CircuitState.OPEN
# Usage
circuit_breaker = CircuitBreaker()
def fetch_data():
return circuit_breaker.call(lambda: external_api.get_data())
```
### Pattern 2: Error Aggregation
Collect multiple errors instead of failing on first error.
```typescript
class ErrorCollector {
private errors: Error[] = [];
add(error: Error): void {
this.errors.push(error);
}
hasErrors(): boolean {
return this.errors.length > 0;
}
getErrors(): Error[] {
return [...this.errors];
}
throw(): never {
if (this.errors.length === 1) {
throw this.errors[0];
}
throw new AggregateError(
this.errors,
`${this.errors.length} errors occurred`,
);
}
}
// Usage: Validate multiple fields
function validateUser(data: any): User {
const errors = new ErrorCollector();
if (!data.email) {
errors.add(new ValidationError("Email is required"));
} else if (!isValidEmail(data.email)) {
errors.add(new ValidationError("Email is invalid"));
}
if (!data.name || data.name.length < 2) {
errors.add(new ValidationError("Name must be at least 2 characters"));
}
if (!data.age || data.age < 18) {
errors.add(new ValidationError("Age must be 18 or older"));
}
if (errors.hasErrors()) {
errors.throw();
}
return data as User;
}
```
### Pattern 3: Graceful Degradation
Provide fallback functionality when errors occur.
```python
from typing import Optional, Callable, TypeVar
T = TypeVar('T')
def with_fallback(
primary: Callable[[], T],
fallback: Callable[[], T],
log_error: bool = True
) -> T:
"""Try primary function, fall back to fallback on error."""
try:
return primary()
except Exception as e:
if log_error:
logger.error(f"Primary function failed: {e}")
return fallback()
# Usage
def get_user_profile(user_id: str) -> UserProfile:
return with_fallback(
primary=lambda: fetch_from_cache(user_id),
fallback=lambda: fetch_from_database(user_id)
)
# Multiple fallbacks
def get_exchange_rate(currency: str) -> float:
return (
try_function(lambda: api_provider_1.get_rate(currency))
or try_function(lambda: api_provider_2.get_rate(currency))
or try_function(lambda: cache.get_rate(currency))
or DEFAULT_RATE
)
def try_function(func: Callable[[], Optional[T]]) -> Optional[T]:
try:
return func()
except Exception:
return None
```
## Best Practices
1. **Fail Fast**: Validate input early, fail quickly
2. **Preserve Context**: Include stack traces, metadata, timestamps
3. **Meaningful Messages**: Explain what happened and how to fix it
4. **Log Appropriately**: Error = log, expected failure = don't spam logs
5. **Handle at Right Level**: Catch where you can meaningfully handle
6. **Clean Up Resources**: Use try-finally, context managers, defer
7. **Don't Swallow Errors**: Log or re-throw, don't silently ignore
8. **Type-Safe Errors**: Use typed errors when possible
```python
# Good error handling example
def process_order(order_id: str) -> Order:
"""Process order with comprehensive error handling."""
try:
# Validate input
if not order_id:
raise ValidationError("Order ID is required")
# Fetch order
order = db.get_order(order_id)
if not order:
raise NotFoundError("Order", order_id)
# Process payment
try:
payment_result = payment_service.charge(order.total)
except PaymentServiceError as e:
# Log and wrap external service error
logger.error(f"Payment failed for order {order_id}: {e}")
raise ExternalServiceError(
f"Payment processing failed",
service="payment_service",
details={"order_id": order_id, "amount": order.total}
) from e
# Update order
order.status = "completed"
order.payment_id = payment_result.id
db.save(order)
return order
except ApplicationError:
# Re-raise known application errors
raise
except Exception as e:
# Log unexpected errors
logger.exception(f"Unexpected error processing order {order_id}")
raise ApplicationError(
"Order processing failed",
code="INTERNAL_ERROR"
) from e
```
## Common Pitfalls
- **Catching Too Broadly**: `except Exception` hides bugs
- **Empty Catch Blocks**: Silently swallowing errors
- **Logging and Re-throwing**: Creates duplicate log entries
- **Not Cleaning Up**: Forgetting to close files, connections
- **Poor Error Messages**: "Error occurred" is not helpful
- **Returning Error Codes**: Use exceptions or Result types
- **Ignoring Async Errors**: Unhandled promise rejections
## Resources
- **references/exception-hierarchy-design.md**: Designing error class hierarchies
- **references/error-recovery-strategies.md**: Recovery patterns for different scenarios
- **references/async-error-handling.md**: Handling errors in concurrent code
- **assets/error-handling-checklist.md**: Review checklist for error handling
- **assets/error-message-guide.md**: Writing helpful error messages
- **scripts/error-analyzer.py**: Analyze error patterns in logs