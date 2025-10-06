#!/bin/bash

echo "🔍 Git Repository Health Check"
echo "================================"

# 1. Check for files with spaces
echo -e "\n1. Checking for Git files with spaces..."
SPACE_FILES=$(find .git -name "* *" 2>/dev/null)
if [ -z "$SPACE_FILES" ]; then
    echo "   ✅ No files with spaces found"
else
    echo "   ⚠️  Found files with spaces:"
    echo "$SPACE_FILES" | sed 's/^/      /'
    echo ""
    read -p "   Remove these files? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$SPACE_FILES" | while read file; do
            rm -f "$file"
            echo "      Removed: $file"
        done
    fi
fi

# 2. Check for broken references
echo -e "\n2. Checking for broken references..."
WARNINGS=$(git status 2>&1 | grep -i warning || true)
if [ -z "$WARNINGS" ]; then
    echo "   ✅ No broken references found"
else
    echo "   ⚠️  Found warnings:"
    echo "$WARNINGS" | sed 's/^/      /'
fi

# 3. Check remote configuration
echo -e "\n3. Checking remote configuration..."
REMOTES=$(git remote -v)
echo "$REMOTES" | sed 's/^/   /'

# 4. Check for duplicate branches
echo -e "\n4. Checking for duplicate local branches..."
BRANCHES=$(git branch -a | grep -E "main [0-9]|master [0-9]" || true)
if [ -z "$BRANCHES" ]; then
    echo "   ✅ No duplicate branches found"
else
    echo "   ⚠️  Found duplicate branches:"
    echo "$BRANCHES" | sed 's/^/      /'
fi

# 5. Run garbage collection
echo -e "\n5. Running Git garbage collection..."
git gc --auto
echo "   ✅ Garbage collection complete"

# 6. Verify repository integrity
echo -e "\n6. Verifying repository integrity..."
git fsck --no-dangling 2>&1 | grep -E "error|warning" || echo "   ✅ Repository integrity verified"

echo -e "\n================================"
echo "Git health check complete!"
echo ""
echo "Tips to prevent future issues:"
echo "• Avoid using VS Code's Git GUI for complex operations"
echo "• Use command line for branch operations"
echo "• Never create branch names with spaces"
echo "• Run this script periodically: ./scripts/git-health-check.sh"