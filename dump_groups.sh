#!/usr/bin/env bash
GROUP_SIZE=${1:-5}
mapfile -t files < <(find . -type d \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -false -o -type f -print | sort)
total=${#files[@]}
groupIndex=0
for ((i=0; i<total; i+=GROUP_SIZE)); do
  echo "=== GROUP $groupIndex START ==="
  for ((j=i; j<i+GROUP_SIZE && j<total; j++)); do
    f="${files[j]}"
    echo "=== FILE: $f ==="
    if file "$f" | grep -qi text; then
      sed -n '1,20000p' "$f" || echo "[UNREADABLE OR ERROR READING]"
    else
      echo "[BINARY OR NON-TEXT FILE]"
    fi
    echo "=== FILE END ==="
  done
  echo "=== GROUP $groupIndex END ==="
  groupIndex=$((groupIndex+1))
done
cat > dump_groups.sh <<'EOF'
#!/usr/bin/env bash
GROUP_SIZE=${1:-5}
mapfile -t files < <(find . -type d \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -false -o -type f -print | sort)
total=${#files[@]}
groupIndex=0
for ((i=0; i<total; i+=GROUP_SIZE)); do
  echo "=== GROUP $groupIndex START ==="
  for ((j=i; j<i+GROUP_SIZE && j<total; j++)); do
    f="${files[j]}"
    echo "=== FILE: $f ==="
    if file "$f" | grep -qi text; then
      sed -n '1,20000p' "$f" || echo "[UNREADABLE OR ERROR READING]"
    else
      echo "[BINARY OR NON-TEXT FILE]"
    fi
    echo "=== FILE END ==="
  done
  echo "=== GROUP $groupIndex END ==="
  groupIndex=$((groupIndex+1))
done
