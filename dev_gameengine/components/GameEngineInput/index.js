import React from 'react';
import GFLabel from '@GFComponents/Labels/GFLabel';
const GameEngineInput = ({
  label,
  desc,
  children,
  width = "100%",
  labelType = 'input',
  isPro = false,
  flexdirection = 'column',
  ...props
}) => {
  return <div className="gameengine-input-box flex flex-col gap-1.5" style={{
    "width": width,
    "flexDirection": flexdirection
  }} {...props}>
            <GFLabel type={labelType} label={label} isPro={isPro} />
            {children}
            {desc ? <GFLabel type="simple" label={desc} /> : null}
        </div>;
};
export default GameEngineInput;