# Missing Ships Data - Action Required

## Issue Summary
**Status:** 🔴 **CRITICAL - UX Impact**
**Affected File:** `src/types/ShipData.ts`
**Impact:** 189 ships are missing from the detailed ship database

## Background
The ship database has two components:
1. **Manufacturer Arrays** - Lists of all ships by manufacturer (227 ships)
2. **Detailed Ship Database** - Full ship data with specs, images, roles (only 39 ships)

This discrepancy means the Fleet view may show:
- Broken/missing ship images
- "Unknown Ship" placeholders
- Incomplete ship selection dropdowns

## Analysis
Run the analysis script to see current status:
```bash
node scripts/check-missing-database-ships.js
```

The script output is saved in: `missing-ships-report.txt`

## Fix Strategy

### Option A: Automated Integration (Recommended)
Create a script to fetch ship data from Star Citizen API or UEX:

```bash
# 1. Install dependencies
npm install axios cheerio

# 2. Create integration script
# File: src/scripts/integrate-missing-ships.ts
# - Parse missing-ships-report.txt
# - Fetch ship data from https://uexcorp.space/ or SC API
# - Populate shipDatabase with real specs

# 3. Run integration
npm run integrate-ships

# 4. Verify
node scripts/check-missing-database-ships.js
# Should report 0 missing ships
```

### Option B: Manual Entry (Time-Intensive)
1. Open `missing-ships-report.txt`
2. Copy ship templates (lines 6+)
3. Manually fill in specs for each ship:
   - size, role, crewRequirement, maxCrew
   - cargoCapacity, length, beam, height
   - speedSCM, speedBoost, status
4. Add to `src/types/ShipData.ts` shipDatabase array

**Estimated Time:** 15-20 hours for manual entry

### Option C: Gradual Integration (Pragmatic)
1. Identify the **top 20 most popular ships** (check usage analytics)
2. Manually add those first
3. Schedule remaining ships for future sprints
4. Add placeholder logic to handle missing ships gracefully

## Immediate Mitigation
Add fallback handling in Fleet components:

```typescript
// src/components/fleet-ops/ShipSelector.tsx
const getShipDetails = (shipName: string) => {
  const shipData = shipDatabase.find(s => s.name === shipName);

  if (!shipData) {
    // Fallback for missing ships
    return {
      name: shipName,
      manufacturer: "Unknown",
      image: getShipImagePath(shipName) || '/images/ships/placeholder.png',
      size: "Medium",
      role: ["Multi-role"],
      status: "Flight Ready"
    };
  }

  return shipData;
};
```

## Priority Ships to Add First
Based on Star Citizen popularity and AydoCorp fleet composition:

### Tier 1 (Essential - Add Immediately)
1. Aegis Avenger Titan
2. Anvil Carrack
3. Crusader C2 Hercules
4. Drake Cutlass Black
5. Origin 325a
6. RSI Aurora MR
7. Aegis Redeemer
8. Misc Freelancer
9. Anvil Hornet
10. Drake Corsair

### Tier 2 (High Priority)
11-30. See missing-ships-report.txt for complete list

### Tier 3 (Lower Priority)
31-189. Concept ships, variants, and specialized vessels

## Resources
- **Star Citizen Ship Database:** https://robertsspaceindustries.com/ship-matrix
- **UEX Ship Database:** https://uexcorp.space/ships
- **Community Wiki:** https://starcitizen.tools/Ships
- **Erkul DPS Calculator:** https://www.erkul.games/

## Acceptance Criteria
- [ ] All 189 missing ships added to shipDatabase
- [ ] Each ship has complete metadata (no placeholder values)
- [ ] Ship images exist or fallback gracefully
- [ ] Fleet UI shows ship details correctly
- [ ] Script check-missing-database-ships.js reports 0 missing

## Notes
- Ship stats change with SC patches - plan for periodic updates
- Consider creating a database migration system for ship data
- Image assets for ships should be stored in `/public/images/ships/`
- Use consistent naming: `manufacturer_shipname.png` (lowercase, underscores)

---
**Created:** 2025-11-18 (Operation Stanton Prime Audit)
**Last Updated:** 2025-11-18
**Priority:** HIGH - Affects user experience in Fleet Operations
