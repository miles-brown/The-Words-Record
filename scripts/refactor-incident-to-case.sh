#!/bin/bash

# Comprehensive refactor script: Incident → Case
# This script systematically renames all incident references to case

set -e

echo "🔄 Starting comprehensive Incident → Case refactor..."

# Function to replace in file
replace_in_file() {
    local file="$1"
    local from="$2"
    local to="$3"

    if [ -f "$file" ]; then
        sed -i '' "s/$from/$to/g" "$file"
    fi
}

# 1. Update type names (case-sensitive)
echo "📝 Updating type names..."
find pages lib components scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' \
    -e 's/IncidentWithRelations/CaseWithRelations/g' \
    -e 's/IncidentFormData/CaseFormData/g' \
    -e 's/IncidentData/CaseData/g' \
    -e 's/IncidentCardSkeleton/CaseCardSkeleton/g' \
    {} \;

# 2. Update function names
echo "🔧 Updating function names..."
find pages lib components scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' \
    -e 's/importIncident/importCase/g' \
    -e 's/fetchIncidents/fetchCases/g' \
    -e 's/parseMarkdownIncidents/parseMarkdownCases/g' \
    {} \;

# 3. Update variable declarations - incidents (plural)
echo "📦 Updating array variable names..."
find pages lib components scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' \
    -e 's/const incidents =/const cases =/g' \
    -e 's/let incidents =/let cases =/g' \
    -e 's/\[\] incidents/[] cases/g' \
    -e 's/: incidents/: cases/g' \
    {} \;

# 4. Update URL paths
echo "🔗 Updating URL paths..."
find pages components -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' \
    -e 's|/incidents/|/cases/|g' \
    -e 's|href="/incidents"|href="/cases"|g' \
    {} \;

# 5. Update field names
echo "📋 Updating field names..."
find pages lib components scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' \
    -e 's/incidentDate/caseDate/g' \
    -e 's/\.incidents/\.cases/g' \
    {} \;

echo "✅ Refactor complete!"
echo ""
echo "⚠️  Manual review needed for:"
echo "   - Variable names 'incident' (singular) - may need context-specific renaming"
echo "   - Comments and documentation"
echo "   - Log messages"
