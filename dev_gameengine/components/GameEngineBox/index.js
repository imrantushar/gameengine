import React from 'react';
import GFLabel from '@GFComponents/Labels/GFLabel';
const GameEngineBox = ({
  dynamicClasses,
  heading,
  children,
  ...props
}) => {
  const classes = ["gameengine-inner-page-content", dynamicClasses && dynamicClasses].filter(Boolean).join(" ");
  return <div className={classes} {...props}>
            {heading && <GFLabel type="heading" label={heading} />}
            {children}
        </div>;
};
export default GameEngineBox;