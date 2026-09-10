import React from 'react';
import { useSortable } from '@dnd-kit/sortable';

/**
 * An active hook card, sortable within its column.
 *
 * Unlike the Available column's plain draggable, these DO take dnd-kit's
 * transform: that is what slides the surrounding cards aside to open a gap
 * where the dragged card will land, which is the whole drop affordance. The
 * card being dragged fades out of its old slot while the <DragPreview />
 * follows the pointer.
 */
export const SortableHook = ({ id, children }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, data: { preview: children } });

	const style = {
		transform: transform
			? `translate3d(${transform.x}px, ${transform.y}px, 0)`
			: undefined,
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`gameengine-draggable-hook gameengine-sortable-hook${isDragging ? ' is-dragging' : ''}`}
			{...listeners}
			{...attributes}
		>
			{children}
		</div>
	);
};

export default SortableHook;
