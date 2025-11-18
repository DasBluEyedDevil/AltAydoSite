# Template Strip Resource Display Enhancement

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Replace creation date with stacked resource summary (ships/personnel counts) and move secondary/tertiary activities to expanded view only.

**Architecture:** Remove creation date display from collapsed header, add calculated resource counts with icons in stacked vertical layout, add secondary/tertiary activity badges to expanded Operation Details section.

**Tech Stack:** React, TypeScript, Framer Motion, MobiGlas UI components

---

## Task 1: Add Resource Summary Icons

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:8-31` (icon section)

**Context from Gemini:**
Current file has icons for Edit, Trash, Arrow, and Template. Need to add Ship and Person icons for resource display.

**Step 1: Add ShipIcon component**

Add after the existing TemplateIcon (around line 31):

```typescript
const ShipIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PersonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
```

**Step 2: Verify icons render**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "feat(ui): add ship and person icons for resource display"
```

---

## Task 2: Create Resource Summary Helper Function

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:46-53` (before component definition)

**Step 1: Add helper function before TemplateStrip component**

Add before the `const TemplateStrip: React.FC<TemplateStripProps>` line (around line 46):

```typescript
/**
 * Calculate total resource counts from template rosters
 */
const calculateResourceCounts = (template: MissionTemplateResponse) => {
  const shipCount = template.shipRoster.reduce((sum, ship) => sum + ship.count, 0);
  const personnelCount = template.personnelRoster.reduce((sum, person) => sum + person.count, 0);
  return { shipCount, personnelCount };
};
```

**Step 2: Verify helper compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "feat(ui): add resource count calculation helper"
```

---

## Task 3: Replace Creation Date with Resource Summary

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:117-122` (Right side section)

**Context:**
Currently displays creation date in a div with `hidden lg:block`. Replace with stacked resource display.

**Step 1: Add resource count calculation in component**

At the start of the TemplateStrip component body (after the opening brace, around line 54), add:

```typescript
const { shipCount, personnelCount } = calculateResourceCounts(template);
```

**Step 2: Replace creation date div with resource summary**

Replace the div at lines 119-121:

```typescript
{/* OLD CODE TO REMOVE:
<div className="hidden lg:block text-sm text-[rgba(var(--mg-text),0.6)]">
  {new Date(template.createdAt).toLocaleDateString()}
</div>
*/}

{/* NEW CODE: */}
{/* Resource Summary */}
{(shipCount > 0 || personnelCount > 0) && (
  <div className="flex flex-col gap-1 text-xs text-[rgba(var(--mg-text),0.7)] min-w-[80px]">
    {shipCount > 0 && (
      <div className="flex items-center gap-1.5">
        <div className="text-[rgba(var(--mg-primary),0.8)]">
          <ShipIcon />
        </div>
        <span>×{shipCount}</span>
      </div>
    )}
    {personnelCount > 0 && (
      <div className="flex items-center gap-1.5">
        <div className="text-[rgba(var(--mg-primary),0.8)]">
          <PersonIcon />
        </div>
        <span>×{personnelCount}</span>
      </div>
    )}
  </div>
)}
{(shipCount === 0 && personnelCount === 0) && (
  <div className="text-xs text-[rgba(var(--mg-text),0.5)] italic min-w-[80px]">
    No resources
  </div>
)}
```

**Step 3: Verify changes compile**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 4: Visual verification**

Run: `npm run dev`
Navigate to Mission Template Creator page
Expected:
- Creation date no longer visible
- Resource counts displayed in stacked format
- Icons have cyan glow effect
- "No resources" shows for templates with empty rosters

**Step 5: Commit**

```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "feat(ui): replace creation date with resource summary in template header"
```

---

## Task 4: Add Secondary/Tertiary Activities to Expanded View

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:174-193` (Operation Details section in expanded view)

**Context:**
Currently Operation Details section shows type and activities as text. Add badges for secondary/tertiary activities after the text display.

**Step 1: Add activity badges after Operation Details content**

After the closing `</div>` of the activities display (around line 192), add new section:

```typescript
                </div>
              </div>

              {/* Secondary/Tertiary Activity Badges */}
              {(template.secondaryActivity || template.tertiaryActivity) && (
                <div className="mt-4 p-3 rounded border border-[rgba(var(--mg-primary),0.15)] bg-[rgba(var(--mg-panel-dark),0.3)]">
                  <h5 className="text-xs font-semibold text-[rgba(var(--mg-text),0.6)] mb-2 uppercase tracking-wide">
                    Additional Activities
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {template.secondaryActivity && (
                      <div className="px-2 py-1 rounded bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.3)] shadow-[0_0_10px_rgba(var(--mg-primary),0.2)]">
                        <span className="text-xs text-[rgba(var(--mg-primary),0.8)] font-medium">
                          {template.secondaryActivity}
                        </span>
                      </div>
                    )}
                    {template.tertiaryActivity && (
                      <div className="px-2 py-1 rounded bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.3)] shadow-[0_0_10px_rgba(var(--mg-primary),0.2)]">
                        <span className="text-xs text-[rgba(var(--mg-primary),0.8)] font-medium">
                          {template.tertiaryActivity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
```

**Step 2: Verify changes compile**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Visual verification**

Run: `npm run dev`
Navigate to Mission Template Creator page
Expected:
- Secondary/tertiary activities NOT visible in collapsed view
- When expanded, activities show as small badges below Operation Details
- Badges have cyan glow and proper spacing
- Section only appears if secondary or tertiary activities exist

**Step 4: Commit**

```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "feat(ui): add secondary/tertiary activity badges to expanded view"
```

---

## Task 5: Final Verification

**Files:**
- All modified files

**Step 1: Run full type check**

Run: `npm run type-check`
Expected: Exit 0, no errors

**Step 2: Visual testing checklist**

Run: `npm run dev`

Test scenarios:
1. **Template with ships only**: Should show ship count, no personnel line
2. **Template with personnel only**: Should show personnel count, no ship line
3. **Template with both**: Should show both stacked vertically
4. **Template with no resources**: Should show "No resources" text
5. **Template with secondary activity**: Should show badge in expanded view
6. **Template with tertiary activity**: Should show badge in expanded view
7. **Template with both activities**: Should show two badges side-by-side
8. **Template with no secondary/tertiary**: Should not show additional activities section
9. **Responsive**: Check on mobile width - resource counts should remain visible

**Step 3: Git diff review**

Run: `git diff`
Review all changes:
- ✅ Icons added (ShipIcon, PersonIcon)
- ✅ Helper function added (calculateResourceCounts)
- ✅ Creation date removed
- ✅ Resource summary added with conditional rendering
- ✅ Secondary/tertiary badges added to expanded view
- ✅ All existing functionality preserved

**Step 4: Query Gemini for architectural validation**

Run: `gemini -p "@src/components/dashboard/TemplateStrip.tsx Verify that the resource summary display and activity badges follow MobiGlas UI patterns and React best practices. Check for any issues."`

Expected: Gemini confirms proper implementation

**Step 5: Final commit (if any fixes needed)**

```bash
git add .
git commit -m "fix(ui): address final review findings"
```

---

## Commit Strategy

After all tasks complete:

```bash
# Verify all changes staged
git status

# Create summary commit if needed
git log --oneline -5

# All commits should be present:
# - feat(ui): add ship and person icons for resource display
# - feat(ui): add resource count calculation helper
# - feat(ui): replace creation date with resource summary in template header
# - feat(ui): add secondary/tertiary activity badges to expanded view
```

---

## Success Criteria

- ✅ Creation date no longer displayed
- ✅ Resource counts (ships/personnel) displayed in stacked format
- ✅ Resource counts visible on all screen sizes
- ✅ Icons have cyan glow matching MobiGlas theme
- ✅ "No resources" message for empty templates
- ✅ Secondary/tertiary activities appear as badges in expanded view only
- ✅ Activities section only renders when activities exist
- ✅ All existing functionality preserved
- ✅ TypeScript compiles without errors
- ✅ Responsive design maintained
- ✅ Gemini architectural validation passed
