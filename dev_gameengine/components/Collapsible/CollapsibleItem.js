import React from 'react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';

const CollapsibleItem = ({
  label,
  children,
  open,
  onClick,
  dynamicClasses
}) => {
  const classes = [
    "gameengine-collapsible", 
    "flex flex-col items-center justify-between w-auto p-6 gameengine-border",
    dynamicClasses && dynamicClasses
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="flex justify-between items-center w-full cursor-pointer" onClick={onClick}>
        <GFLabel type="plainHeading" margin={0} padding={0}
          // translators: %s: label
          label={label} />

        {open ? <LuChevronUp size="20px" /> : <LuChevronDown size="20px" />}
      </div>

      {children}
    </div>
  );
};

export default CollapsibleItem;
