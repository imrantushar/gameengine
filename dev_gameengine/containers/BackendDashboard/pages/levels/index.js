import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import LevelTable from './LevelTable';

const Levels = () => {
    return (
        <>
            <TopBar path={__("Levels", "gameengine")} />
            <LevelTable />
        </>
    );
};

export default Levels;
