import React from 'react';

const GameEngineBox = ({
  dynamicClasses,
  heading,
  children,
  // Style-shaped props left over from Chakra. React would forward these onto
  // the DOM node as unknown attributes, so pull them out and apply them as
  // real inline styles instead.
  boxShadow,
  width,
  style,
  ...props
}) => {
  const classes = ["gameengine-inner-page-content", dynamicClasses && dynamicClasses].filter(Boolean).join(" ");

  // The heading is usually a string, but loaders pass a <Skeleton /> element.
  // A <p> cannot contain the divs that renders, so only wrap real text in one.
  const Heading = typeof heading === 'string' ? 'p' : 'div';

  return (
    <div
      className={classes}
      style={{
        ...(boxShadow ? { boxShadow } : {}),
        ...(width ? { width } : {}),
        ...style,
      }}
      {...props}
    >
      {heading && (
        <Heading className='text-[20px] font-medium leading-[30px] m-[0_0_24px_0]'>
          {heading}
        </Heading>
      )}
      {children}
    </div>
  );
};

export default GameEngineBox;
