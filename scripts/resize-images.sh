#!/usr/bin/env bash
# Resize JPG/PNG images in place to a web-friendly size using macOS `sips`.
# Usage:    ./scripts/resize-images.sh <directory> [max-pixels]
# Defaults: max 2000px on the long edge, JPEG quality 82.
# Idempotent: skips images already within the size cap.
# Destructive: overwrites originals. Keep a backup elsewhere if you need one.

set -euo pipefail

DIR="${1:?usage: $0 <directory> [max-pixels]}"
MAX="${2:-2000}"
QUALITY=82

if [[ ! -d "$DIR" ]]; then
    echo "error: $DIR is not a directory" >&2
    exit 1
fi

shopt -s nullglob nocaseglob

found=0
for img in "$DIR"/*.jpg "$DIR"/*.jpeg "$DIR"/*.png; do
    found=1
    w=$(sips -g pixelWidth "$img" | awk '/pixelWidth/ {print $2}')
    h=$(sips -g pixelHeight "$img" | awk '/pixelHeight/ {print $2}')
    long=$(( w > h ? w : h ))
    name=$(basename "$img")
    before=$(du -h "$img" | cut -f1)

    if (( long <= MAX )); then
        printf '  skip  %-50s  %dx%d  %s\n' "$name" "$w" "$h" "$before"
        continue
    fi

    sips -Z "$MAX" -s formatOptions "$QUALITY" "$img" >/dev/null
    w2=$(sips -g pixelWidth "$img" | awk '/pixelWidth/ {print $2}')
    h2=$(sips -g pixelHeight "$img" | awk '/pixelHeight/ {print $2}')
    after=$(du -h "$img" | cut -f1)
    printf '  done  %-50s  %dx%d -> %dx%d  %s -> %s\n' "$name" "$w" "$h" "$w2" "$h2" "$before" "$after"
done

if (( found == 0 )); then
    echo "no jpg/jpeg/png files in $DIR"
fi
