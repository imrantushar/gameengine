import React, { useState } from 'react';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import AchievementsTable from './AchievementsTable';
import GetHelp from '@GFComponents/GetHelp';
import Button from '@GFComponents/Button';
import WhatsNew from '@GFComponents/WhatsNew';
import { TfiAnnouncement } from 'react-icons/tfi';

const Achievements = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <TopBar
                path={__("Achievements", "gameengine")}
                rightContent={
                    <div className="flex items-center gap-2">
                        <Button
                            label={__("What's New", "gameengine")}
                            icon={<TfiAnnouncement />}
                            iconPosition="left"
                            preset="white"
                            border="gray"
                            onClick={() => setIsDrawerOpen(true)}
                        />
                        <GetHelp filterText={['achievements']} />
                    </div>
                }
            />

            <AchievementsTable />

            <WhatsNew isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
        </>
    );
};

export default Achievements;
