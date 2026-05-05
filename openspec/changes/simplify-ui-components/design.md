## Context

`components/UI` was created as a drop-in replacement for `@chakra-ui/react` during a migration. It kept the compound-component pattern Chakra uses (Root/Trigger/Positioner/Content contexts) but most of those abstractions are now unused. Only `Switch`, `Checkbox`, `Spinner`, `Menu`, and `Popover` are imported anywhere — and `Menu`/`Popover` exist solely as scaffolding for the two tooltip components.

The tooltip positioning is currently broken: `Menu.Positioner` / `Popover.Positioner` use `position: absolute` but are rendered inside a `createPortal` into `document.body`. Absolute positioning in body doesn't anchor to the trigger element — the tooltip floats incorrectly in many layouts.

## Goals / Non-Goals

**Goals:**
- Reduce `UI/` to exactly 3 files: `Switch.js`, `Checkbox.js`, `Spinner.js`
- Replace compound component APIs with single-component props APIs
- Fix tooltip positioning using real screen coordinates from `getBoundingClientRect`
- Support all 10 placement variants in the new Tooltip
- Delete all code that is not imported by anything

**Non-Goals:**
- Changing the visual design of `CustomSwitch` (SCSS-based, stays untouched)
- Replacing `CustomSwitch` usage with the new `Switch`
- Adding animation to tooltip show/hide
- Supporting tooltip trigger types other than hover

## Decisions

### 1. Single-component API for Switch and Checkbox

**Decision**: Replace `Switch.Root / Switch.HiddenInput / Switch.Control` with `<Switch checked onChange />`.

**Rationale**: The compound pattern only made sense when Chakra provided the context and styling primitives. Now that the components are fully custom, the context layer adds indirection with no benefit. A hidden input, a visible control, and a label can all live inside one component without leaking internal state.

**Alternative considered**: Keep compound pattern, just simplify internals. Rejected — callers still pay the verbosity cost and the 10 call sites would still need 3-4 lines each instead of 1.

### 2. Tooltip uses fixed positioning via getBoundingClientRect

**Decision**: On hover, measure `triggerRef.current.getBoundingClientRect()`, compute `top`/`left` in viewport space, render `<div style={{ position: 'fixed', top, left }}>` into `document.body` via `createPortal`.

**Rationale**: Fixed positioning with explicit coordinates is the only reliable way to paint a tooltip on top of everything regardless of scroll, overflow:hidden containers, or stacking contexts. `position: absolute` inside a portal is inherently broken — absolute is relative to the nearest positioned ancestor in the real DOM, not the trigger.

**Alternative considered**: CSS-only tooltip (no portal). Rejected — clips inside overflow:hidden containers which are common in this admin UI.

### 3. All 10 placement variants

**Decision**: Support `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`, `left-start`, `left-end`, `right-start`, `right-end`.

**Placement coordinate logic**:
```
top-*:    tipTop  = triggerTop - tipHeight - gap
bottom-*: tipTop  = triggerBottom + gap
left-*:   tipLeft = triggerLeft - tipWidth - gap
right-*:  tipLeft = triggerRight + gap

*-start:  align to trigger start edge
*-center: center on trigger axis
*-end:    align to trigger end edge
```

**Rationale**: KodezenTooltip already exposes all these variants to callers. Dropping them would be a breaking change to consumer code.

### 4. Delete extractStyleProps entirely

**Decision**: Remove `utils.js` and all `extractStyleProps` calls from surviving components.

**Rationale**: `extractStyleProps` was a shim for passing Chakra-style props (px, py, maxW, bg, etc.) as JSX props instead of inline styles. No callers of the new simplified components need this — they pass plain `className`/`style`. The 150-line prop-aliasing table is pure dead weight.

### 5. Delete CustomTooltip

**Decision**: Delete `Tooltip/CustomTooltip.js`.

**Rationale**: It wraps `Menu` to produce a dark-bg tooltip. `KodezenTooltip` with `variant="blue"` or a dark variant covers the same need. Two tooltip wrappers over the same broken positioning implementation is worse than one correct one.

## Risks / Trade-offs

- **10 call sites need updating** → Each update is mechanical (Switch.Root + 3 children → single `<Switch>` tag). Low risk of introducing bugs; easy to verify visually.
- **Tooltip flicker on fast mouse movement** → `getBoundingClientRect` is called on each hover enter. Negligible performance cost for admin UI usage.
- **Tooltip position on scroll** → Fixed-position tooltips don't reposition if the user scrolls while hovering. Acceptable for an admin panel where tooltips are ephemeral on hover.

## Migration Plan

1. Create new `UI/Switch.js`, `UI/Checkbox.js`, `UI/Spinner.js`
2. Update `UI/index.js` to export only those three
3. Update all 10 call sites (Switch.Root → Switch, Checkbox.Root → Checkbox)
4. Rebuild `Tooltip/KodezenTooltip.js` with portal + coordinate logic
5. Delete `Tooltip/CustomTooltip.js`
6. Delete all unused UI files (`Button.js`, `Dialog.js`, `Layout.js`, `Typography.js`, `Media.js`, `Table.js`, `utils.js`, `Menu.js`, `Popover.js`, old `Forms.js`, old `Feedback.js`)

No server-side or database changes. Rollback = revert files.

## Open Questions

- Should the new `Switch` accept a `label` prop, or should callers put a label alongside it in their own JSX? (Current Switch.Label was rarely used — most callers had their own label markup.)
