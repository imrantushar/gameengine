import React from 'react';
import { Box } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const SettingsInner = ({children, heading}) => {
    return (
        <Box bg="var(--gamify-background)" boxShadow="var(--gamify-shadow)" borderRadius='4px' width="calc(100% - 300px)" p="24px">
            <GFLabel type="heading" label={heading} />
            {children}
        </Box>
    );
};

export default SettingsInner;
