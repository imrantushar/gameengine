import React from 'react';

const GameEngineBox = ({
  dynamicClasses,
  heading,
  children,
  ...props
}) => {
  const classes = ["gameengine-inner-page-content", dynamicClasses && dynamicClasses].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {heading && <p className='text-[20px] font-medium leading-[30px] m-[0_0_24px_0]'>{heading}</p>}
      {children}
    </div>
  );
};

export default GameEngineBox;
