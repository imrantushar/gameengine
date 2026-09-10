import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import LevelTable from './LevelTable';
import GetHelp from '@GFComponents/GetHelp';
import WhatsNew from '@GFComponents/WhatsNew';

const Levels = () => {
    return (
        <>
            <TopBar path={__("Levels", "gameengine")}
                rightContent={
                    <div className="flex items-center gap-2">
                        <WhatsNew />

                        <GetHelp filterText={['levels']} />
                    </div>
                }
            />
            <LevelTable />
        </>
    );
};

export default Levels;
