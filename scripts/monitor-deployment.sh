#!/bin/bash

echo "Monitoring Vercel deployment for header fix..."
echo "Current build: hyoT6be3fZjk4Jn0jDv4U"
echo ""

OLD_BUILD="hyoT6be3fZjk4Jn0jDv4U"
ATTEMPTS=0
MAX_ATTEMPTS=15

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  ATTEMPTS=$((ATTEMPTS + 1))

  echo -n "Attempt $ATTEMPTS/$MAX_ATTEMPTS: "

  CURRENT_BUILD=$(curl -s "https://who-said-what.vercel.app" | grep -o "static/[^\"]*/_buildManifest.js" | head -1 | cut -d'/' -f2)

  if [ "$CURRENT_BUILD" != "$OLD_BUILD" ] && [ ! -z "$CURRENT_BUILD" ]; then
    echo "✅ NEW BUILD DEPLOYED: $CURRENT_BUILD"
    echo ""
    echo "Verifying header fix is live..."

    # Check if header has min-height in CSS
    curl -s "https://who-said-what.vercel.app" | grep -q "min-height.*60px" && echo "✅ Header min-height fix confirmed!" || echo "⚠️  Header fix may not be applied yet"

    exit 0
  else
    echo "Still old build - waiting 20s..."
  fi

  sleep 20
done

echo ""
echo "⏰ Timeout. Check manually at: https://vercel.com/dashboard"