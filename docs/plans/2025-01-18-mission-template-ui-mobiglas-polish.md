# Mission Template UI - MobiGlas Polish Implementation Plan

> **For Claude:** This plan will be executed using the Token-Efficient Quadrumvirate approach: Cursor CLI implements, Copilot CLI cross-checks, Gemini verifies architecture.

**Goal:** Upgrade Mission Template UI components to use MobiGlas design system for polished, consistent styling matching site theme.

**Architecture:** Replace plain modals, buttons, and detail panels with MobiGlas components (`MobiGlasPanel`, `MobiGlasButton`). Preserve all existing functionality, state management, and event handlers. Focus on visual presentation layer only.

**Tech Stack:** React, TypeScript, Framer Motion, MobiGlas UI components, Tailwind CSS

---

## Task 1: Upgrade Delete Confirmation Modal (MissionTemplateCreator.tsx)

**Files:**
- Modify: `src/components/dashboard/MissionTemplateCreator.tsx:603-635` (delete modal section)

**Context from Gemini:**
- Current modal uses plain `<div>` with basic styling
- Target: `MobiGlasPanel` with `variant="darker"`, `cornerAccents={true}`
- Buttons should use `MobiGlasButton` with appropriate variants

**Step 1: Add MobiGlas imports**

At top of `MissionTemplateCreator.tsx`, verify/add imports:

```typescript
import { MobiGlasPanel, MobiGlasButton } from '@/components/ui/mobiglas';
```

**Step 2: Replace delete modal structure**

Replace the delete confirmation modal (lines ~603-635) with:

```tsx
<AnimatePresence>
  {showDeleteConfirm && (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowDeleteConfirm(null)}
    >
      <MobiGlasPanel
        variant="darker"
        cornerAccents={true}
        className="max-w-md mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <h3
          id="delete-modal-title"
          className="text-lg font-semibold text-[rgba(var(--mg-danger),0.9)] mb-4"
        >
          Confirm Deletion
        </h3>
        <p className="text-[rgba(var(--mg-text),0.8)] mb-6">
          Are you sure you want to delete this mission template? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <MobiGlasButton
            onClick={() => setShowDeleteConfirm(null)}
            variant="outline"
            size="md"
          >
            Cancel
          </MobiGlasButton>
          <MobiGlasButton
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            variant="primary"
            className="border-[rgba(var(--mg-danger),0.8)] text-[rgba(var(--mg-danger),0.9)] hover:bg-[rgba(var(--mg-danger),0.2)]"
            size="md"
            disabled={isLoading}
          >
            Delete
          </MobiGlasButton>
        </div>
      </MobiGlasPanel>
    </motion.div>
  )}
</AnimatePresence>
```

**Step 3: Visual verification**

- Run dev server: `npm run dev`
- Navigate to Mission Template Creator page
- Click delete icon on a template
- Verify:
  - Modal has MobiGlas styling with corner accents
  - Backdrop blur is present
  - Scale animation on open/close
  - Both buttons have proper styling
  - Modal can be dismissed by clicking outside or Cancel button
  - Delete button still triggers delete action

**Step 4: Take screenshots**

Take screenshots showing:
1. Delete modal open (showing MobiGlas styling)
2. Hover state on Cancel button
3. Hover state on Delete button

---

## Task 2: Enhance Success/Error Notifications (MissionTemplateCreator.tsx)

**Files:**
- Modify: `src/components/dashboard/MissionTemplateCreator.tsx` (notification section, look for success/error message rendering)

**Context from Gemini:**
- Current notifications are custom-styled but could be more integrated
- Wrap in `MobiGlasPanel` for consistency

**Step 1: Locate notification rendering**

Find the success/error notification rendering code (likely near state variables `successMessage` or `errorMessage`).

**Step 2: Wrap notification in MobiGlasPanel**

If notification currently looks like:
```tsx
{successMessage && (
  <div className="fixed top-4 right-4 bg-green-500 p-4 rounded">
    {successMessage}
  </div>
)}
```

Replace with:
```tsx
{successMessage && (
  <motion.div
    className="fixed top-4 right-4 z-50"
    initial={{ x: 400, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 400, opacity: 0 }}
  >
    <MobiGlasPanel
      variant="dark"
      cornerAccents={true}
      className="min-w-[300px]"
    >
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-success),0.9)]" />
        <p className="text-[rgba(var(--mg-text),0.9)]">{successMessage}</p>
      </div>
    </MobiGlasPanel>
  </motion.div>
)}
```

Apply similar pattern for error messages (using `--mg-danger` color).

**Step 3: Visual verification**

- Trigger success message (e.g., save a template)
- Trigger error message (e.g., delete with error)
- Verify:
  - Notification slides in from right
  - Has MobiGlas panel styling
  - Corner accents visible
  - Proper colors (green for success, red for error)

**Step 4: Take screenshots**

Screenshot showing notification with MobiGlas styling.

---

## Task 3: Upgrade Action Buttons (TemplateStrip.tsx)

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:158-176` (action buttons)

**Context from Gemini:**
- Current: Simple `<button>` elements with hover effects
- Target: `MobiGlasButton` with `variant="ghost"` and `size="sm"`

**Step 1: Add MobiGlas imports**

Verify/add at top of `TemplateStrip.tsx`:

```typescript
import { MobiGlasButton } from '@/components/ui/mobiglas';
```

**Step 2: Replace action buttons**

Find the action buttons div (around lines 158-176), replace with:

```tsx
<div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
  <MobiGlasButton
    onClick={onEdit}
    variant="ghost"
    size="sm"
    title="Edit Template"
    aria-label={`Edit ${template.name}`}
  >
    <EditIcon className="w-4 h-4" />
  </MobiGlasButton>

  <MobiGlasButton
    onClick={onDelete}
    variant="ghost"
    size="sm"
    className="text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)] hover:bg-[rgba(var(--mg-danger),0.2)]"
    title="Delete Template"
    aria-label={`Delete ${template.name}`}
  >
    <TrashIcon className="w-4 h-4" />
  </MobiGlasButton>

  {!isExpanded && (
    <MobiGlasButton
      onClick={onUseForMission}
      variant="ghost"
      size="sm"
      className="text-[rgba(var(--mg-success),0.8)] hover:text-[rgba(var(--mg-success),1)] hover:bg-[rgba(var(--mg-success),0.2)]"
      title="Use for Mission"
      aria-label={`Use ${template.name} for new mission`}
    >
      <ArrowRightIcon className="w-4 h-4" />
    </MobiGlasButton>
  )}
</div>
```

**Step 3: Visual verification**

- View template strips in collapsed state
- Verify all three buttons visible (Edit, Delete, Use)
- Expand a template strip
- Verify only Edit and Delete buttons visible
- Test hover states for each button:
  - Edit: cyan hover effect
  - Delete: red hover effect
  - Use: green hover effect
- Click each button to verify functionality preserved

**Step 4: Take screenshots**

Screenshots showing:
1. All three buttons in collapsed state with hover
2. Edit and Delete buttons in expanded state

---

## Task 4: Convert Detail Panels to MobiGlasPanel (TemplateStrip.tsx)

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx:201-288` (expanded detail sections)

**Context from Gemini:**
- Current: Custom styled divs for "Operation Details", "Ship Roster", etc.
- Target: `MobiGlasPanel variant="transparent" withGridBg={true}`

**Step 1: Locate detail sections in expanded view**

Find the expanded content section (around lines 201-288) that contains:
- Operation Details
- Ship Roster (conditional)
- Mission Objectives (conditional)
- Notes (conditional)

**Step 2: Wrap each section in MobiGlasPanel**

Replace each detail section. Example for Operation Details:

**Before:**
```tsx
<div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
    Operation Details
  </h4>
  {/* content */}
</div>
```

**After:**
```tsx
<MobiGlasPanel
  variant="transparent"
  padding="sm"
  withGridBg={true}
  cornerAccents={false}
>
  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
    Operation Details
  </h4>
  {/* content - keep existing */}
</MobiGlasPanel>
```

Apply the same pattern to:
- **Ship Roster section** (if `template.shipRoster.length > 0`)
- **Mission Objectives section** (if `template.missionObjectives.length > 0`)
- **Notes section** (if `template.notes`)

**Step 3: Visual verification**

- Expand a template strip
- Verify all detail sections now have:
  - Subtle grid background
  - Consistent panel styling
  - Proper spacing maintained
- Check responsive design (mobile view)
- Verify content still displays correctly

**Step 4: Take screenshots**

Screenshots showing:
1. Expanded template with all detail panels visible
2. Close-up of one panel showing grid background effect

---

## Task 5: Cross-Check & Final Verification

**This task will be delegated to Copilot CLI for cross-checking Cursor's implementation.**

**Files to Review:**
- `src/components/dashboard/MissionTemplateCreator.tsx`
- `src/components/dashboard/TemplateStrip.tsx`

**Review Checklist:**

1. **Code Quality**
   - All MobiGlas components properly imported
   - No TypeScript errors
   - Proper prop types used
   - Accessibility attributes maintained

2. **Functionality Preservation**
   - All click handlers still work
   - Modal dismiss functionality intact
   - Template expand/collapse works
   - Notifications display correctly
   - No regressions in existing features

3. **Visual Consistency**
   - All components use MobiGlas theme
   - Colors match site palette (cyan/blue theme)
   - Animations smooth and appropriate
   - Responsive design maintained

4. **Testing**
   - Run: `npm run type-check`
   - Run: `npm run lint`
   - Manual testing of all interactive elements
   - Check browser console for errors

5. **Performance**
   - No unnecessary re-renders
   - Animations perform smoothly
   - No console warnings

**Expected Outcome:**
- Clean type-check output
- Clean lint output
- All functionality working
- Professional, polished MobiGlas UI throughout

---

## Implementation Notes

**For Cursor CLI (Developer #1):**
- You will implement Tasks 1-4
- Focus on visual presentation only
- Preserve all existing logic and state management
- Take screenshots at each verification step
- Report back with summary of changes and screenshots

**For Copilot CLI (Developer #2):**
- You will perform Task 5 (cross-check)
- Review Cursor's implementation for quality and correctness
- Run type-check and lint commands
- Test all interactive functionality
- Report findings with severity ratings

**For Claude Code (Orchestrator):**
- After both implementations, query Gemini to verify architectural consistency
- Use `superpowers:verification-before-completion` before claiming done
- Present screenshots and results to user

---

## Commit Strategy

**After Task 1-2 (MissionTemplateCreator):**
```bash
git add src/components/dashboard/MissionTemplateCreator.tsx
git commit -m "feat(ui): upgrade Mission Template modals and notifications to MobiGlas theme

- Replace delete modal with MobiGlasPanel and MobiGlasButton
- Enhance notifications with MobiGlas styling
- Add scale animations to modal entrance/exit
- Maintain all existing functionality"
```

**After Task 3-4 (TemplateStrip):**
```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "feat(ui): upgrade TemplateStrip components to MobiGlas theme

- Replace action buttons with MobiGlasButton variants
- Convert detail panels to MobiGlasPanel components
- Add grid backgrounds for visual consistency
- Maintain expand/collapse functionality and animations"
```

**After Task 5 (Verification):**
```bash
# Only if fixes were needed
git add [any fixed files]
git commit -m "fix(ui): address cross-check findings from Mission Template polish"
```
