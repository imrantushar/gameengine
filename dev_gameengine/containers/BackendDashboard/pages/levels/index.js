import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import LevelTable from './LevelTable';
import GetHelp from '@GFComponents/GetHelp';

const Levels = () => {
    return (
        <>
            <TopBar path={__("Levels", "gameengine")} rightContent={<GetHelp filterText={['levels']} />} />
            <LevelTable />
        </>
    );
};

export default Levels;
