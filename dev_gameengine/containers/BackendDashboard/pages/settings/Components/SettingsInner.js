import React from 'react';
import { Box } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const SettingsInner = ({children, heading, fullWidth=false}) => {
    return (
        <Box bg="var(--gameengine-background)" boxShadow="var(--gameengine-shadow)" borderRadius='4px' width={fullWidth ? "100%" : "calc(100% - 300px)"} p="24px">
            <GFLabel type="heading" label={heading} />
            {children}
        </Box>
    );
};

export default SettingsInner;
