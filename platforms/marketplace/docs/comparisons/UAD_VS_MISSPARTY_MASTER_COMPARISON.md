# 📊 Master Comparison: UAD vs. Miss Party

This sheet breaks down every operational and logistical difference between the two systems.

---

### 🛠️ Core Logistics

| Feature | **UAD (Garage Doors)** | **Miss Party (Bounce House)** |
| :--- | :--- | :--- |
| **Phone Numbers** | 🔄 **4 Rotating Numbers** (972/469) | 📍 **1 Fixed Number** (+1-469-283-9855) |
| **Video Type** | 🎞️ **Static** (Same `video.mp4` for all) | ⚡ **Dynamic** (Unique AI video per listing) |
| **Image Source** | 📁 **Catalogue** (Standard set of photos) | 🤖 **AI-Generated** (DALL-E/Flux scenes) |
| **Pricing** | 💸 **Dynamic** ($1500 - $4500) | 🏷️ **Flat Rate** ($75) |
| **Cool-down** | ☕ 5 posts → 15 min break | 🛑 3 posts → 30 min break |

---

### ⚙️ Automation Implementation

| Component | **UAD System** | **Miss Party System** |
| :--- | :--- | :--- |
| **n8n Workflow** | `Garage Door Generator` | `Miss Party Generator` |
| **Data Table** | `6T8jI35R2tX1Mni9` | `cNJEtuc3uOiFrDsB` |
| **Script Path** | `/opt/.../index.js` | `/opt/.../missparty-bot.js` |
| **GoLogin Profile** | `...f79c` (Shai) | `...0f37` (Michal) |
| **Unique ID** | Model + Size + Color hash | Scenario + Timestamp hash |

---

### 🎯 Business Logic

| Objective | **UAD** | **Miss Party** |
| :--- | :--- | :--- |
| **Category** | Garage Doors | Party Rentals / Toys |
| **Copy Style** | Professional & Technical | Fun & Event-focused |
| **Location** | Wide DFW (20+ cities) | Focused (Plano/Frisco core) |
| **Goal** | High-ticket installation leads | Recurring weekend rental volume |

---

### 🛡️ Stealth Level
*   **UAD**: Moderate. Relies on rotating numbers.
*   **Miss Party**: **High**. Every single listing has a unique appearance, unique video, and unique description context (backyard vs living room).
