import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';
import StreaksTable from './StreaksTable';

const Streaks = () => {
    return (
        <>
            <TopBar path={__('Streaks', 'gameengine')} rightContent={<GetHelp filterText={['streaks']} />} />
            <StreaksTable />
        </>
    );
};

export default Streaks;
