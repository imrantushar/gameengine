import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';
import RanksTable from './RanksTable';

const Ranks = () => {
    return (
        <>
            <TopBar path={__('Ranks', 'gameengine')} rightContent={<GetHelp filterText={['ranks']} />} />
            <RanksTable />
        </>
    );
};

export default Ranks;
