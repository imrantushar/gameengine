import { useDraggable } from '@dnd-kit/core';
export const DraggableItem = ({
  id,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.85 : 1,
    cursor: "grab",
    zIndex: isDragging ? 999 : 1
  };
  return <div style={style} ref={setNodeRef} {...listeners} {...attributes} marginBottom="24px">
            {children}
        </div>;
};