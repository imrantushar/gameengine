import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

const SettingsInput = ({ label, desc, children, width = "100%", ...props }) => {
    return (
        <Flex direction="row" justifyContent="space-between" alignItems="center" gap="6px" width={width} {...props}>
            <Text fontSize="14px" fontWeight="500" lineHeight="20px" color="var(--gameengine-font-color)" m="0">{label}</Text>
            {children}
        </Flex>
    );
};

export default SettingsInput;
