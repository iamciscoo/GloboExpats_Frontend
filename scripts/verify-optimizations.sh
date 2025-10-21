#!/bin/bash

# =============================================================================
# Verification Script for Platform Optimizations
# =============================================================================
# 
# This script verifies that all optimizations have been applied correctly
# and that the platform is functioning as expected.
#

set -e

echo "🔍 Starting Optimization Verification..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
ERRORS=0
WARNINGS=0

# =============================================================================
# 1. Check Removed Files
# =============================================================================
echo "📁 Checking removed files..."

REMOVED_FILES=(
  "components/cart-example.tsx"
  "components/css-test.tsx"
  "components/ui/chart.tsx"
  "components/ui/breadcrumb.tsx"
  "components/ui/navigation-menu.tsx"
  "components/ui/drawer.tsx"
  "components/ui/input-otp.tsx"
  "components/ui/resizable.tsx"
  "components/ui/calendar.tsx"
  "components/ui/command.tsx"
  "components/ui/hover-card.tsx"
  "components/ui/menubar.tsx"
  "components/ui/aspect-ratio.tsx"
  "components/ui/toggle.tsx"
  "components/ui/toggle-group.tsx"
)

for file in "${REMOVED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${RED}❌ File should be removed: $file${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Removed: $file${NC}"
  fi
done

# =============================================================================
# 2. Check Removed Assets
# =============================================================================
echo ""
echo "🖼️  Checking removed assets..."

if [ -d "public/assets/images/placeholders" ]; then
  echo -e "${RED}❌ Placeholder directory should be removed${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Placeholder directory removed${NC}"
fi

# =============================================================================
# 3. Check Package.json
# =============================================================================
echo ""
echo "📦 Checking package.json..."

REMOVED_PACKAGES=(
  "recharts"
  "input-otp"
  "vaul"
  "react-resizable-panels"
  "embla-carousel-autoplay"
  "critters"
  "react-day-picker"
  "cmdk"
)

for pkg in "${REMOVED_PACKAGES[@]}"; do
  if grep -q "\"$pkg\"" package.json; then
    echo -e "${RED}❌ Package should be removed: $pkg${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Removed: $pkg${NC}"
  fi
done

# =============================================================================
# 4. Check New Files Created
# =============================================================================
echo ""
echo "📝 Checking new files..."

NEW_FILES=(
  "components/common/optimized-image.tsx"
  "Docs/optimization/AUDIT_FINDINGS.md"
  "Docs/optimization/OPTIMIZATION_SUMMARY.md"
)

for file in "${NEW_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  Missing new file: $file${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}✅ Created: $file${NC}"
  fi
done

# =============================================================================
# 5. TypeScript Check
# =============================================================================
echo ""
echo "🔧 Running TypeScript check..."

if npm run type-check > /dev/null 2>&1; then
  echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
  echo -e "${RED}❌ TypeScript compilation failed${NC}"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# 6. Bundle Size Estimation
# =============================================================================
echo ""
echo "📊 Estimating bundle improvements..."

if [ -d ".next" ]; then
  NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
  echo -e "${GREEN}✅ Next.js build directory: $NEXT_SIZE${NC}"
else
  echo -e "${YELLOW}⚠️  No .next directory found (run 'npm run build' first)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# =============================================================================
# 7. Summary
# =============================================================================
echo ""
echo "========================================="
echo "📈 Verification Summary"
echo "========================================="
echo -e "${GREEN}✅ Checks passed: $((15 - ERRORS - WARNINGS))${NC}"
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Errors: $ERRORS${NC}"
fi
echo "========================================="

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Verification failed with $ERRORS error(s)${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ All optimizations verified successfully!${NC}"
  exit 0
fi
