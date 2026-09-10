import React from 'react';

/**
 * A titled white panel.
 *
 * The panel is a `.gameengine-surface`: hairline border, 8px radius, no drop
 * shadow — so it reads as a card against the grey admin background.
 */
const BoxView = ({
  title,
  subtitle,
  children,
  width = 'calc(50% - 8px)',
  p = '16px',
  rightContent,
  minWidth,
}) => {
  // Title and subtitle share one block so the subtitle sits under the title
  // instead of being pushed out of it (a <p> cannot nest inside a <p>).
  const heading = title ? (
    <div>
      <p className="text-xl font-semibold m-0 text-[var(--gameengine-font-color)] leading-[30px]">
        {title}
      </p>
      {subtitle ? (
        <p className="text-sm font-normal leading-5 m-0 text-[var(--gameengine-warn-muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  ) : null;

  return (
    <div
      className="gameengine-surface"
      style={{
        minWidth: minWidth,
        width: width,
      }}
    >
      {rightContent ? (
        <div className="flex justify-between items-center gap-4 p-4 [border-bottom:1px_solid_var(--gameengine-border-color)]">
          {heading}
          {rightContent}
        </div>
      ) : heading ? (
        <div className="p-4 [border-bottom:1px_solid_var(--gameengine-border-color)]">
          {heading}
        </div>
      ) : null}

      <div
        style={{
          padding: p,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BoxView;
