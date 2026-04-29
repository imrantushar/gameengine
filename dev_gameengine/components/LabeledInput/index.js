import React from 'react';
import GFLabel from '@GFComponents/Labels/GFLabel';
const LabeledInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  style,
  inputStyle,
  textAreaSize,
  onBlur,
  isPro = false
}) => {
  const InputComponent = type === 'textarea' ? Textarea : Input;
  return <div className="flex flex-col gap-2" style={{
    ...{
      ...style
    }
  }} as="label">
      <GFLabel label={label} fontWeight="600" fontSize="0.875rem" margin={0} isPro={isPro} />

      <InputComponent className="gameengine-input" type={type !== "textarea" ? type : undefined} placeholder={placeholder} value={value} onChange={onChange} style={{
      ...inputStyle
    }} onBlur={onBlur} />
    </div>;
};
export default LabeledInput;