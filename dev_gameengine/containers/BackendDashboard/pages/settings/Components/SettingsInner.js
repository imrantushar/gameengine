import React from 'react';

const SettingsInner = ({
  children,
  heading,
  fullWidth = false,
  width = 'calc(100% - 300px)'
}) => {
  return (
    <div
      className="rounded p-6 bg-[var(--gameengine-background)] shadow-[var(--gameengine-shadow)]"
      style={{ "width": fullWidth ? "100%" : width ? width : "" }}
    >
      <p className="gameengine-settings-heading">
        {heading}
      </p>

      {children}
    </div>
  );
};

export default SettingsInner;
