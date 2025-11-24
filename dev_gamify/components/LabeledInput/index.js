import React from 'react';
import { Flex, Text, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';

const LabeledInput = ({ label, placeholder, value, onChange,type='text',style}) => (
  <Flex as="label" direction="column" gap={2} style={{...style}}>
    <Text fontWeight="500" fontSize="0.875rem" margin={0}>
      {__(label, 'gamify')}
    </Text>
    <Input
      className="gamify-input"
      type={type}
      placeholder={__(placeholder, 'gamify')}
      value={value}
      onChange={onChange}
    />
  </Flex>
);

export default LabeledInput;
