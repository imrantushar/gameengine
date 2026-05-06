import React from 'react';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import AchievementsTable from './AchievementsTable';
import GetHelp from '@GFComponents/GetHelp';

const Achievements = () => {
    return (
        <>
            <TopBar path={__("Achievements", "gameengine")} rightContent={<GetHelp filterText={['achievements']} />} />
            <AchievementsTable />
        </>
    );
};

export default Achievements;
