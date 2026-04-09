import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const SettingsInner = ({ children, heading, fullWidth = false }) => {
    return (
        <Box bg="var(--gameengine-background)" boxShadow="var(--gameengine-shadow)" borderRadius='4px' width={fullWidth ? "100%" : "calc(100% - 300px)"} p="24px">
            <Text
                fontSize="20px"
                fontWeight="500"
                color="var(--gameengine-font-color)"
                lineHeight="30px"
                margin='0 0 24px 0'
                padding='0 0 16px 0'
                borderBottom="1px solid var(--gameengine-border-color)"
            >
                {heading}
            </Text>
            
            {children}
        </Box>
    );
};

export default SettingsInner;
