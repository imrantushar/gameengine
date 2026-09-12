import React from 'react';
import Switch from '@GFComponents/Switch/Switch';

/**
 * A switch with its label beside it, and an optional hint underneath.
 *
 * The two editors that need this had written it twice with different layouts —
 * one stacked the label above the switch, the other put it in a row — so the
 * same control looked like two different things.
 *
 * @param {boolean}   checked  Current state.
 * @param {Function}  onChange Called with the next state.
 * @param {string}    label    Sits beside the switch.
 * @param {React.Node} hint    Optional second line, e.g. what is still needed.
 * @param {boolean}   disabled Greys the switch out.
 */
const ToggleField = ({ checked, onChange, label, hint, disabled = false }) => (
	<div className="flex items-start gap-3">
		<div style={{ paddingTop: '1px' }}>
			<Switch checked={checked} onChange={onChange} disabled={disabled} />
		</div>

		<div className="flex flex-col gap-0.5">
			<span
				style={{
					fontSize: '14px',
					fontWeight: '500',
					lineHeight: '20px',
					color: 'var(--gameengine-font-color)',
				}}
			>
				{label}
			</span>

			{hint && (
				<span className="text-xs leading-5 text-[var(--gameengine-warn-muted)]">
					{hint}
				</span>
			)}
		</div>
	</div>
);

export default ToggleField;
