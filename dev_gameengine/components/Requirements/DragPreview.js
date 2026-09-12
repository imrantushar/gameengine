import React from 'react';
import { DragOverlay, useDndContext } from '@dnd-kit/core';

/**
 * The card that follows the pointer during a drag.
 *
 * Rendered outside the two columns, so it can pass over either without
 * disturbing their layout — which is the whole point of an overlay. It reads
 * the active card straight off the drag context, so the owners just drop this
 * inside their <DndContext> with no props.
 *
 * `dropAnimation={null}`: on release the card is either accepted (the lists
 * re-render with it in its new column) or rejected (it never left its slot).
 * Animating the overlay back to an origin that has already changed reads as a
 * glitch, so it just disappears.
 */
const DragPreview = () => {
	const { active } = useDndContext();
	const preview = active?.data?.current?.preview;

	return (
		<DragOverlay dropAnimation={null}>
			{preview ? (
				<div className="gameengine-hook-drag-preview">{preview}</div>
			) : null}
		</DragOverlay>
	);
};

export default DragPreview;
