---
description: How to integrate with external APIs (Kie.ai, OpenAI, etc.)
---

# API Integration - RALPH-Style Verification Loop

When working with external APIs:

## 1. Research First
- ASK for or search for official API documentation
- Do NOT guess parameter names or structures
- Verify required vs optional fields

## 2. Test Before Declaring Success
- API returning 200 doesn't mean it worked
- Check the actual response body for errors
- Common gotchas:
  - `422`: Missing required field (check docs again)
  - `400`: Malformed JSON or wrong parameter types
  - `200` with error in body: API-specific validation failed

## 3. Iterate on Failures
When an API call fails:
1. Read the exact error message
2. Cross-reference with documentation
3. Fix the specific issue
4. Test again
5. Only declare success after 2+ successful iterations

## 4. Kie.ai Specific Notes
- Storyboard models require `shots` array
- Each shot needs `scene` (string) and `duration` (number)
- `n_frames` options: "10", "15", "25"
- `aspect_ratio` options: "portrait", "landscape"

## Key Principle
> Follow the docs exactly. When in doubt, ask for docs.
