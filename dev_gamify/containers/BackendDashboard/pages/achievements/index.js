import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import AchievementsTable from './AchievementsTable';

const Achievements = () => {
    return (
        <>
            <TopBar path={__("Achievements", "gamify")} />
            <AchievementsTable />
        </>
    );
};

export default Achievements;