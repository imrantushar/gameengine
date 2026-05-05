## 1. New UI Components

- [x] 1.1 Create `UI/Switch.js` — single-component toggle with checkmark thumb, props: `checked`, `onChange`, `disabled`, `className`
- [x] 1.2 Create `UI/Checkbox.js` — single-component checkbox with checkmark, props: `checked`, `onChange`, `disabled`, `className`
- [x] 1.3 Create `UI/Spinner.js` — copy Spinner from current `Feedback.js`, remove `extractStyleProps` dependency, use plain inline styles
- [x] 1.4 Rewrite `UI/index.js` to export only `Switch`, `Checkbox`, `Spinner`

## 2. Update Switch Call Sites

- [x] 2.1 Update `containers/BackendDashboard/pages/settings/Tabs/Dashboard.js`
- [x] 2.2 Update `containers/BackendDashboard/pages/settings/Tabs/Economy.js`
- [x] 2.3 Update `containers/BackendDashboard/pages/settings/Tabs/EmailTemplates.js`
- [x] 2.4 Update `containers/BackendDashboard/pages/settings/Tabs/GeneralSettings.js`
- [x] 2.5 Update `containers/BackendDashboard/pages/settings/Tabs/Payout.js`
- [x] 2.6 Update `containers/BackendDashboard/pages/settings/Tabs/ReferralSettings.js`
- [x] 2.7 Update `containers/BackendDashboard/pages/achievements/AchievementTypesEditor/FormInner.js`
- [x] 2.8 Update `containers/BackendDashboard/pages/levels/levelTypes/FormInner.js`

## 3. Update Checkbox Call Sites

- [x] 3.1 Update `containers/Setup/Pages/Settings/Steps/Addons/index.js`

## 4. Rebuild Tooltip

- [x] 4.1 Rewrite `Tooltip/KodezenTooltip.js` — use `useRef` on trigger, `getBoundingClientRect` on hover, `createPortal` into `document.body`, `position: fixed` with computed coordinates, all 10 placement variants
- [x] 4.2 Delete `Tooltip/CustomTooltip.js`

## 5. Delete Unused UI Files

- [x] 5.1 Delete `UI/Button.js`
- [x] 5.2 Delete `UI/Dialog.js`
- [x] 5.3 Delete `UI/Layout.js`
- [x] 5.4 Delete `UI/Typography.js`
- [x] 5.5 Delete `UI/Media.js`
- [x] 5.6 Delete `UI/Table.js`
- [x] 5.7 Delete `UI/utils.js`
- [x] 5.8 Delete `UI/Menu.js`
- [x] 5.9 Delete `UI/Popover.js`
- [x] 5.10 Delete old `UI/Forms.js`
- [x] 5.11 Delete old `UI/Feedback.js`
