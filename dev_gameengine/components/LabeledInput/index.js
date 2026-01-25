import React from 'react';
import { Flex, Text, Input, Textarea } from '@chakra-ui/react';

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
}) => {
  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <Flex as="label" direction="column"  gap={2} style={{ ...style }}>
      <Text fontWeight="600" fontSize="0.875rem" margin={0}>
        {label}
      </Text>

      <InputComponent
        className="gameengine-input"
        type={type !== "textarea" ? type : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...inputStyle }}
        onBlur={onBlur}
      />
    </Flex>
  );
};

export default LabeledInput;
