## ADDED Requirements

### Requirement: Single-component checkbox API
The Checkbox component SHALL accept `checked` (boolean) and `onChange` (function receiving the new boolean value) as its primary props, replacing the compound `Checkbox.Root / Checkbox.HiddenInput / Checkbox.Control` API.

#### Scenario: Checked state
- **WHEN** `checked={true}` is passed
- **THEN** the checkbox renders with primary color fill and a white ✓ SVG checkmark

#### Scenario: Unchecked state
- **WHEN** `checked={false}` is passed
- **THEN** the checkbox renders with white fill and grey border, no checkmark

#### Scenario: onChange fires with new value
- **WHEN** user clicks the checkbox
- **THEN** `onChange` is called with the next boolean value

#### Scenario: Disabled state
- **WHEN** `disabled={true}` is passed
- **THEN** the checkbox is non-interactive with cursor not-allowed
