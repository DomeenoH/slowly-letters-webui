
#!/bin/bash
# Clean up old hashed images, keeping only the new YYYYMMDD named ones.

BASE_DIR="/Volumes/杂项/slowly/PenPals"
echo "Cleaning up legacy hashed images in $BASE_DIR..."

# Find and delete files matching the hash pattern (e.g. 51130694-...)
# New files start with 202... so they are safe.
find "$BASE_DIR" -type f -name "[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-*.jpg" -print -delete
find "$BASE_DIR" -type f -name "[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-*.jpeg" -print -delete

echo "Cleanup complete."
