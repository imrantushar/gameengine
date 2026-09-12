import React from 'react';
import { pointerWithin, rectIntersection, useDraggable } from '@dnd-kit/core';

/**
 * A hook card that can be dragged between the Available and Active columns.
 *
 * The card deliberately does NOT move: dnd-kit's `transform` is left unused
 * and the node keeps its slot in the list, dimmed. What follows the pointer is
 * the <DragPreview /> overlay, which renders outside the list. Translating the
 * node in place instead — as this did — left it in the document flow while
 * visually offset, so it slid on top of whatever card sat below it and the
 * list showed the same item twice.
 *
 * `children` rides along in the drag data so the overlay can render the exact
 * card being dragged without the caller having to plumb it through.
 */
export const DraggableItem = ({ id, children }) => {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id,
		data: { preview: children },
	});

	return (
		<div
			ref={setNodeRef}
			className={`gameengine-draggable-hook${isDragging ? ' is-dragging' : ''}`}
			{...listeners}
			{...attributes}
		>
			{children}
		</div>
	);
};

/**
 * Index a card dropped on `overId` should take in the active list.
 *
 * `overId` is either another card in the column — drop before it — or the
 * column itself, which means the pointer was over empty space below the last
 * card, so it goes on the end.
 *
 * @param {string|number} overId      What the pointer was released over.
 * @param {Array}         sortableIds The active column's card ids, in order.
 * @return {number} Insertion index.
 */
export const dropIndex = (overId, sortableIds) => {
	const index = sortableIds.indexOf(overId);
	return index === -1 ? sortableIds.length : index;
};

/**
 * A copy of `list` with `item` spliced in at `index`.
 */
export const insertAt = (list, item, index) => {
	const next = [ ...list ];
	next.splice(index, 0, item);
	return next;
};

/**
 * Collision detection for the two hook columns.
 *
 * Each column is a droppable AND holds card droppables of its own, so a
 * distance-based strategy keeps answering with the column: it is far the
 * bigger rectangle and its centre is often nearer the pointer than any
 * individual card's. That makes every drop land at the end of the list and
 * leaves the card under the pointer unaware it is the target.
 *
 * Cards therefore win outright whenever the pointer is over one; the column is
 * the answer only when the pointer is over its empty space.
 *
 * @param {Object} args dnd-kit collision arguments.
 * @return {Array} The winning collisions.
 */
export const hookCollisionDetection = (args) => {
	const within = pointerWithin(args);
	const hits = within.length > 0 ? within : rectIntersection(args);

	const card = hits.find(
		(hit) => ! isColumnId(hit.id)
	);

	return card ? [ card ] : hits;
};

/**
 * Column droppables are the two ids Requirements registers per section.
 */
const isColumnId = (id) =>
	typeof id === 'string' &&
	(id.endsWith('-sidebar') || id.endsWith('-available'));
