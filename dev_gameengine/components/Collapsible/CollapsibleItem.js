import React from 'react';
import { Icon } from '@GFUtils/ui';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __, sprintf } from '@wordpress/i18n';
const CollapsibleItem = ({
  label,
  children,
  open,
  onClick,
  dynamicClasses
}) => {
  const classes = ["gameengine-collapsible", dynamicClasses && dynamicClasses].filter(Boolean).join(" ");
  return <div className={`${`${classes + " " + "flex flex-col items-center justify-between w-full"} p-6 rounded my-6`} [border:1px_solid_var(--gameengine-border-color)]`}>
            <div className="flex justify-between items-center w-full cursor-pointer" onClick={onClick}>
                <GFLabel type="plainHeading" margin={0} padding={0}
      // translators: %s: label
      label={sprintf(__('%s', 'gemboards'), label)} />

                <Icon as={open ? LuChevronUp : LuChevronDown} boxSize={5} />
            </div>

            {children}
        </div>;
};
export default CollapsibleItem;