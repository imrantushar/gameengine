import React from 'react';
import { Box } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const GameEngineBox = ({dynamicClasses, heading, children, ...props}) => {
    const classes = [
        "gameengine-inner-page-content",
        dynamicClasses && dynamicClasses
    ].filter(Boolean).join(" ");
    
    return (
        <Box className={classes} {...props}>
            {heading && (
                <GFLabel type="heading" label={heading} />
            )}
            {children}
        </Box>
    );
};

export default GameEngineBox;
