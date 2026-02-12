# Kie.ai Nano Banana Pro API

Model: `nano-banana-pro` — Place Realtor into room photos.

## Create Task

- **URL**: `POST https://api.kie.ai/api/v1/jobs/createTask`
- **Auth**: `Authorization: Bearer YOUR_API_KEY`

```json
{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "Professional realtor in business casual, standing at entrance...",
    "image_input": ["https://...realtor-headshot.jpg", "https://...room-photo.jpg"],
    "aspect_ratio": "16:9",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

- `prompt`: required, max 20000 chars
- `image_input`: optional array of URLs, up to 8 images, 30MB each
- `aspect_ratio`: 1:1, 16:9, 9:16, etc.
- `resolution`: 1K, 2K, 4K
- `output_format`: png, jpg

## Query Status

- **URL**: `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...`
- **data.state**: waiting | success | fail
- **data.resultJson**: `{ "resultUrls": ["https://...image.png"] }`
