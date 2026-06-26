#!/usr/bin/env bash
# Prépare le groupe 0 (fichiers essentiels)
files=("package.json" "tsconfig.json" "jsconfig.json" "src/lib/supabase.ts" "src/pages/Home.tsx")

echo "=== GROUP 0 START ==="
for f in "${files[@]}"; do
  if [ -f "$f" ]; then
    echo "=== FILE: $f ==="
    sed -n '1,20000p' "$f"
    echo "=== FILE END ==="
  fi
done
echo "=== GROUP 0 END ==="
