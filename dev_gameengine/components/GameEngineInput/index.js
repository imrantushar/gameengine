import React from 'react';
import { Flex } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const GameEngineInput = ({ label, desc, children, width = "100%", labelType='input', ...props}) => {
    return (
        <Flex direction="column" gap="6px" width={width} {...props} className='gameengine-input-box'>
            <GFLabel type={labelType} label={label} />
            {children}
            {desc ? <GFLabel type="simple" label={desc} /> : null}
        </Flex>
    );
};

export default GameEngineInput;
