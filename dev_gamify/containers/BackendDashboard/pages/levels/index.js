import React from 'react';
import { Box, Flex, } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { gIcon } from '@GFUtils/icons';
import LevelTable from './LevelTable';

const Levels = () => {
    return (
        <>
            <TopBar
                leftContent={() => (
                    <Flex align="center" gap={2}>
                        {gIcon()}
                        <Box width="4px" height="6px" bg="var(--gamify-primary)" />
                        <GFLabel type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                    </Flex>
                )}
            />

            <LevelTable />
        </>
    );
};

export default Levels;
