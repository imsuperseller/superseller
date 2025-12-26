#!/bin/bash

# Directories to process
PUBLIC_DIR="/Users/shaifriedman/New Rensto/rensto/apps/web/rensto-site/public"
TARGET_DIRS=(
  "$PUBLIC_DIR"
  "$PUBLIC_DIR/assets/brand"
  "$PUBLIC_DIR/icons"
  "$PUBLIC_DIR/images/testimonials"
)

# Function to convert image
convert_image() {
  local src="$1"
  local base="${src%.*}"
  local ext="${src##*.}"
  
  if [[ "$ext" == "webp" || "$ext" == "avif" || "$ext" == "svg" ]]; then
    return
  fi

  echo "Processing $src..."

  # Convert to WebP
  if [ ! -f "${base}.webp" ]; then
    cwebp -q 80 "$src" -o "${base}.webp"
  fi

  # Convert to AVIF
  if [ ! -f "${base}.avif" ]; then
    magick "$src" -quality 60 "${base}.avif"
  fi
  
  # Optimize original PNG/JPG if possible (lossless-ish)
  if [[ "$ext" == "png" ]]; then
    magick "$src" -strip -optimize "$src" 2>/dev/null || sips -s format png "$src" --out "$src" >/dev/null
  elif [[ "$ext" == "jpg" || "$ext" == "jpeg" ]]; then
    magick "$src" -strip -interlace Plane -quality 85 "$src" 2>/dev/null || sips -s format jpeg -s formatOptions 85 "$src" --out "$src" >/dev/null
  fi
}

for dir in "${TARGET_DIRS[@]}"; do
  echo "Checking directory: $dir"
  if [ -d "$dir" ]; then
    for file in "$dir"/*.{png,jpg,jpeg}; do
      if [ -f "$file" ]; then
        convert_image "$file"
      fi
    done
  fi
done

echo "Compression complete!"
