#!/bin/bash

set -e

ROOT_DIR="$(pwd)"
DIST_DIR="$ROOT_DIR/dist"
SLIDES_DIR="$DIST_DIR/slides"
ZIPS_DIR="$DIST_DIR/zips"
SHARED_DIR="$ROOT_DIR/shared"

# Check if zip is installed
if ! command -v zip &> /dev/null; then
  echo "❌ The 'zip' command is not installed."
  echo "Install it using: sudo apt install zip"
  exit 1
fi

# Clean previous build
rm -rf "$DIST_DIR"

# Create base folders
mkdir -p "$SLIDES_DIR" "$ZIPS_DIR"

# Copy all numeric slide folders into dist/slides
for dir in */ ; do
  DIR_NAME="${dir%/}"

  if [[ "$DIR_NAME" =~ ^[0-9]+$ ]]; then
    echo "📁 Copying slide $DIR_NAME"
    rsync -a "$DIR_NAME/" "$SLIDES_DIR/$DIR_NAME/"
  fi
done

# Process each slide
for slide in "$SLIDES_DIR"/*/ ; do
  SLIDE_NAME="$(basename "$slide")"

  CSS_DIR="$slide/css"
  JS_DIR="$slide/js"
  IMG_DIR="$slide/images"
  INDEX_HTML="$slide/index.html"
  CSS_FILE="$CSS_DIR/shared.css"
  ZIP_PATH="$ZIPS_DIR/$SLIDE_NAME.zip"

  echo "🔧 Processing slide $SLIDE_NAME"

  # Ensure required folders exist
  mkdir -p "$CSS_DIR" "$JS_DIR" "$IMG_DIR"

  # Copy shared CSS and JS
  [[ -f "$SHARED_DIR/shared.css" ]] && cp "$SHARED_DIR/shared.css" "$CSS_FILE"
  [[ -f "$SHARED_DIR/shared.js" ]] && cp "$SHARED_DIR/shared.js" "$JS_DIR/shared.js"

  # Copy shared images to slide images folder
  find "$SHARED_DIR" -maxdepth 1 -type f \( \
    -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o \
    -iname "*.gif" -o -iname "*.svg" -o -iname "*.webp" \
  \) -exec cp {} "$IMG_DIR/" \;

  # Fix CSS and JS paths in index.html
  if [[ -f "$INDEX_HTML" ]]; then
    sed -i \
      -e 's|\.\./shared/shared\.css|css/shared.css|g' \
      -e 's|\.\./shared/shared\.js|js/shared.js|g' \
      "$INDEX_HTML"
  fi

  # Fix image paths inside the copied CSS file
  if [[ -f "$CSS_FILE" ]]; then
    sed -i 's|\.\./shared/|../images/|g' "$CSS_FILE"
  fi

  # Create individual slide ZIP (content only)
  echo "📦 Creating $SLIDE_NAME.zip"
  (
    cd "$slide"
    zip -r "$ZIP_PATH" . > /dev/null
  )

done

# Create ZIP containing all slide folders (not individually zipped)
echo "📦 Creating slides.zip"
(
  cd "$SLIDES_DIR"
  zip -r "$DIST_DIR/slides.zip" . > /dev/null
)

# Create ZIP containing only the slide ZIP files
echo "📦 Creating slides-zips.zip"
(
  cd "$ZIPS_DIR"
  zip -r "$DIST_DIR/slides-zips.zip" . > /dev/null
)

echo "✅ Build completed successfully"
