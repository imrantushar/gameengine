import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import { fetchAchievements } from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import AchievementsTable from './AchievementsTable';

const Achievements = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAchievements());
    }, [dispatch]);

    return (
        <>
            <TopBar path={__("Achievements", "gamify")} />

            <AchievementsTable />
        </>
    );
};

export default Achievements;