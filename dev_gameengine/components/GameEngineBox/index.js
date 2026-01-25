import React from 'react';
import { Box } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const GameEngineBox = ({dynamicClasses, heading, children}) => {
    const classes = [
        "gameengine-inner-page-content",
        dynamicClasses && dynamicClasses
    ].filter(Boolean).join(" ");
    
    return (
        <Box className={classes}>
            <GFLabel type="heading" label={heading} />
            {children}
        </Box>
    );
};

export default GameEngineBox;
