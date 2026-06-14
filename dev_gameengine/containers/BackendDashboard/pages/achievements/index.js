import React, { useState } from 'react';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import AchievementsTable from './AchievementsTable';
import GetHelp from '@GFComponents/GetHelp';
import WhatsNew from '@GFComponents/WhatsNew';

const Achievements = () => {
    return (
        <>
            <TopBar
                path={__("Achievements", "gameengine")}
                rightContent={
                    <div className="flex items-center gap-2">
                        <WhatsNew />

                        <GetHelp filterText={['achievements']} />
                    </div>
                }
            />

            <AchievementsTable />
        </>
    );
};

export default Achievements;
