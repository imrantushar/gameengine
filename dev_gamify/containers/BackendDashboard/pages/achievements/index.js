import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import { Box, Flex, } from '@chakra-ui/react';
import { aIcon } from "@GFUtils/icons";
import { fetchAchievements } from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import AchievementsTable from './AchievementsTable';

const Achievements = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAchievements());
    }, [dispatch]);

    return (
        <>
            <TopBar
                leftContent={() => (
                    <Flex align="center" gap={2}>
                        {aIcon()}
                        <Box width="4px" height="6px" bg="var(--gamify-primary)" />
                        <GFLabel type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                    </Flex>
                )}
            />

            <AchievementsTable />
        </>
    );
};

export default Achievements;