import React from 'react';
const SettingsInner = ({
  children,
  heading,
  fullWidth = false, 
  width='calc(100% - 300px)'
}) => {
  return <div className="rounded p-6 bg-[var(--gameengine-background)] [box-shadow:var(--gameengine-shadow)]" style={{
    "width": fullWidth ? "100%" : width ? width : ""
  }}>
      <p className="text-xl font-medium text-[var(--gameengine-font-color)] border-0 border-b border-solid border-[var(--gameengine-border-color)]" style={{
        "lineHeight": "30px",
        "margin": "0 0 24px 0",
        "padding": "0 0 16px 0"
      }}>
        {heading}
      </p>
            
            {children}
        </div>;
};
export default SettingsInner;