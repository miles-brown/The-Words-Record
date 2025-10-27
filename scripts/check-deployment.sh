#!/bin/bash

echo "Monitoring Vercel deployment..."
echo "Current build ID: kTzxC2Qxwz6HHbAmBXMxD"
echo ""

OLD_BUILD="kTzxC2Qxwz6HHbAmBXMxD"
CHECKS=0
MAX_CHECKS=20

while [ $CHECKS -lt $MAX_CHECKS ]; do
  CHECKS=$((CHECKS + 1))

  echo -n "Check $CHECKS/$MAX_CHECKS: "

  CURRENT_BUILD=$(curl -s "https://who-said-what.vercel.app" | grep -o "static/[^\"]*/_buildManifest" | head -1 | cut -d'/' -f2)

  if [ -z "$CURRENT_BUILD" ]; then
    echo "Failed to fetch build ID"
  elif [ "$CURRENT_BUILD" != "$OLD_BUILD" ]; then
    echo "✅ NEW BUILD DEPLOYED: $CURRENT_BUILD"
    echo ""
    echo "Checking if header fix is live..."
    curl -s "https://who-said-what.vercel.app/_next/static/css/$(ls -t .next/static/css/ | head -1 2>/dev/null || echo '*.css')" | grep -q "nav-buttons-stack.*overflow.*hidden" && echo "✅ Header fix confirmed in CSS!" || echo "⏳ Checking CSS..."
    exit 0
  else
    echo "Still old build ($CURRENT_BUILD) - waiting..."
  fi

  sleep 15
done

echo ""
echo "⏰ Timeout reached. Build may still be deploying."
echo "Check manually at: https://vercel.com/dashboard"
