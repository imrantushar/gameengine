## ADDED Requirements

### Requirement: Single-component toggle API
The Switch component SHALL accept `checked` (boolean) and `onChange` (function receiving the new boolean value) as its primary props, replacing the compound `Switch.Root / Switch.HiddenInput / Switch.Control` API.

#### Scenario: Controlled toggle on
- **WHEN** `checked={true}` is passed
- **THEN** the track renders with primary color background and the thumb shows a ✓ checkmark

#### Scenario: Controlled toggle off
- **WHEN** `checked={false}` is passed
- **THEN** the track renders with grey background and the thumb shows no checkmark

#### Scenario: onChange fires with new value
- **WHEN** user clicks the switch
- **THEN** `onChange` is called with the next boolean value (opposite of current `checked`)

#### Scenario: Disabled state
- **WHEN** `disabled={true}` is passed
- **THEN** the switch is non-interactive and rendered with reduced opacity cursor not-allowed

### Requirement: Checkmark in thumb
The Switch thumb SHALL display a ✓ SVG checkmark when the switch is in the checked (on) state.

#### Scenario: Checkmark visible when on
- **WHEN** `checked={true}`
- **THEN** a white ✓ icon is visible inside the thumb

#### Scenario: No checkmark when off
- **WHEN** `checked={false}`
- **THEN** the thumb contains no icon
