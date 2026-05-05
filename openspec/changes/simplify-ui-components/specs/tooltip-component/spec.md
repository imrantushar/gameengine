## ADDED Requirements

### Requirement: Portal-based positioning
The Tooltip component SHALL render its content into `document.body` via `createPortal` and position it using `position: fixed` with coordinates derived from `getBoundingClientRect()` on the trigger element.

#### Scenario: Tooltip renders outside DOM tree
- **WHEN** the tooltip is visible
- **THEN** the tooltip element is a direct child of `document.body`, not nested inside the trigger's DOM subtree

#### Scenario: Tooltip positioned relative to trigger
- **WHEN** the tooltip is visible with `placement="top-center"`
- **THEN** the tooltip is centered horizontally above the trigger with a consistent gap

### Requirement: All placement variants
The Tooltip SHALL support the following `placement` values: `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`, `left-start`, `left-end`, `right-start`, `right-end`.

#### Scenario: top-center placement
- **WHEN** `placement="top-center"`
- **THEN** tooltip appears above the trigger, horizontally centered on it

#### Scenario: top-start placement
- **WHEN** `placement="top-start"`
- **THEN** tooltip appears above the trigger, left edge aligned to trigger's left edge

#### Scenario: top-end placement
- **WHEN** `placement="top-end"`
- **THEN** tooltip appears above the trigger, right edge aligned to trigger's right edge

#### Scenario: bottom-* placements mirror top-*
- **WHEN** `placement` begins with `bottom-`
- **THEN** tooltip appears below the trigger with equivalent start/center/end alignment

#### Scenario: left-* placements
- **WHEN** `placement="left-start"` or `placement="left-end"`
- **THEN** tooltip appears to the left of the trigger, aligned to top or bottom edge respectively

#### Scenario: right-* placements
- **WHEN** `placement="right-start"` or `placement="right-end"`
- **THEN** tooltip appears to the right of the trigger, aligned to top or bottom edge respectively

### Requirement: Hover activation with delay
The Tooltip SHALL show on `mouseenter` and hide on `mouseleave` with a configurable `delay` (default 150ms). Hovering the tooltip content itself SHALL cancel the hide timer.

#### Scenario: Show on trigger hover
- **WHEN** user moves mouse over the trigger element
- **THEN** tooltip becomes visible after the delay

#### Scenario: Hide on mouse leave
- **WHEN** user moves mouse away from both trigger and tooltip content
- **THEN** tooltip hides

#### Scenario: Stay open when hovering content
- **WHEN** user moves mouse from trigger to tooltip content without leaving
- **THEN** tooltip remains visible

### Requirement: Variant and arrow props
The Tooltip SHALL accept `variant` (e.g. `"blue"`) and `arrow` (e.g. `"center"`, `"right"`) props that apply CSS class names for styling. `contentWidth` SHALL control the max-width of the content box.

#### Scenario: Variant class applied
- **WHEN** `variant="blue"` is passed
- **THEN** the tooltip element has class `kodezen-tooltip__variant--blue`

#### Scenario: Arrow class applied
- **WHEN** `arrow="center"` is passed
- **THEN** the arrow element has class `kodezen-tooltip__arrow--center`
