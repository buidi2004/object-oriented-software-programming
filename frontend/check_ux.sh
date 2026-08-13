#!/bin/bash
cd /home/object-oriented-software-programming/frontend/app
echo "=== DASHBOARD PAGES ==="
for d in dashboard/*/; do
  if [ -f "${d}page.tsx" ]; then
    echo "--- $d ---"
    wc -l "${d}page.tsx"
  fi
done
echo ""
echo "=== USER FACING PAGES ==="
for page in services services/[id] search cart checkout orders orders/[id] tickets tickets/[id] domains domains/[id]; do
  if [ -f "$page/page.tsx" ] || [ -f "$page]/page.tsx" ]; then
    echo "--- $page ---"
  fi
done
