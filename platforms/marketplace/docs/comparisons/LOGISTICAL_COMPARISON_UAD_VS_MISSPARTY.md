# Operational Comparison: UAD vs. Miss Party

This table details the exact technical logistics and automation differences between the two products.

| Logistics Detail | UAD (Universal Action Doors) | Miss Party (Bounce House) |
| :--- | :--- | :--- |
| **Video Strategy** | **Static Master**: Uses a single high-quality video file (`video.mp4`) for all listings. | **Dynamic Generation**: Generates unique videos for *each listing* via Kie.ai / Sora-style prompts. |
| **Media Source** | **Catalogue Assets**: Standard photos of garage door models (Steel, Classic, etc.). | **AI-Generated**: 4 unique prompts per listing (DALL-E/Flux) for hyper-specific party scenes. |
| **Phone Logic** | **Rotating (4 Numbers)**: Cycles through `972-954-2407`, `972-628-3587`, `469-625-0960`, and `469-535-7538`. | **Fixed (1 Number)**: Exclusively uses `+1-469-283-9855` (Michal's dedicated line). |
| **Pricing Model** | **Dynamic/Scraped**: Prices are calculated or scraped ($1500 - $4500) based on model/size. | **Flat Rate**: Hardcoded at **$49.99** for a 24-hour rental. |
| **Deduplication** | **Attribute Hash**: Hash is built from `Collection + Size + Design + Color`. | **Scenario Hash**: Hash is built from `Setting + KidsCount + Balls + Timestamp`. |
| **Polling Interval** | **20 Minutes** (Schedule Trigger) | **20 Minutes** (Schedule Trigger) |
| **Posting Limit** | **5 Successes** then 15m Cooldown | **3 Successes** then 30m Cooldown (More cautious) |
| **Delivery Logic** | Included in general professional description. | Specific "Free pickup" vs "$1/minute delivery" string. |
| **Category** | "Garage Doors" (Specific) | "Baby & Kids" / "Toys" / "Party Rentals" (General) |

## Key Implementation Difference
The **Miss Party** bot is technically more "modern" and "stealthy" because every single listing has a unique video/image set generated on-the-fly, reducing the footprint that Facebook's AI can detect. **UAD** relies on a larger pool of phone numbers and model variety but uses the same video asset repeatedly.
