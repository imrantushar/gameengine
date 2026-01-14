import React from 'react';
import { Flex } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const GamifyInput = ({ label, desc, children, width = "100%" }) => {
    return (
        <Flex direction="column" gap="6px" width={width}>
            <GFLabel type="title" label={label} />
            {children}
            {desc ? <GFLabel type="simple" label={desc} /> : null}
        </Flex>
    );
};

export default GamifyInput;
