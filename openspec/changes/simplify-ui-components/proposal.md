## Why

`components/UI` is a Chakra UI migration artifact that exports ~40 symbols but only 6 are ever imported anywhere in the project — the rest is dead code inflating the bundle and creating confusion. The surviving components use an over-engineered compound-component pattern (inherited from Chakra) that adds unnecessary layers for what are simple, self-contained UI elements.

## What Changes

- **BREAKING** Delete unused UI files: `Button.js`, `Dialog.js`, `Layout.js`, `Typography.js`, `Media.js`, `Table.js`, `utils.js` (and the `extractStyleProps` machinery)
- **BREAKING** Delete `Menu.js` and `Popover.js` — only used internally by tooltips
- **BREAKING** Simplify `Switch` from compound pattern (`Switch.Root` / `Switch.HiddenInput` / `Switch.Control` / `Switch.Label`) to a single `<Switch checked onChange />` component with a checkmark (✓) in the thumb when active
- **BREAKING** Simplify `Checkbox` from compound pattern (`Checkbox.Root` / `Checkbox.HiddenInput` / `Checkbox.Control`) to a single `<Checkbox checked onChange />` component
- Keep `Spinner` as-is, remove its `extractStyleProps` dependency
- Rebuild `KodezenTooltip` as a standalone component using `createPortal` + `getBoundingClientRect` for real fixed-position rendering; support all placement variants: `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`, `left-start`, `left-end`, `right-start`, `right-end`
- Delete `Tooltip/CustomTooltip.js` — duplicates KodezenTooltip
- Update all ~10 call sites that use the old Switch compound API
- `CustomSwitch` in its own folder stays untouched

## Capabilities

### New Capabilities

- `switch-component`: Simplified single-component toggle with checkmark thumb visual
- `checkbox-component`: Simplified single-component checkbox with checkmark
- `tooltip-component`: Portal-based tooltip with real coordinate positioning and all placement variants

### Modified Capabilities

## Impact

- **Deleted**: `UI/Button.js`, `UI/Dialog.js`, `UI/Layout.js`, `UI/Typography.js`, `UI/Media.js`, `UI/Table.js`, `UI/utils.js`, `UI/Menu.js`, `UI/Popover.js`, `Tooltip/CustomTooltip.js`
- **Rewritten**: `UI/Forms.js` → `UI/Switch.js` + `UI/Checkbox.js`, `UI/Feedback.js` → `UI/Spinner.js`, `UI/index.js`, `Tooltip/KodezenTooltip.js`
- **Updated call sites**: ~10 files across `containers/BackendDashboard/pages/settings/Tabs/`, `containers/BackendDashboard/pages/achievements/`, `containers/BackendDashboard/pages/levels/`, `containers/Setup/`
- No new external dependencies — uses React's built-in `createPortal` and `useRef`
