import React from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';
import WhatsNew from '@GFComponents/WhatsNew';
import RewardsTable from './RewardsTable';

const RewardsStore = () => {
    return (
        <>
            <TopBar
                path={__('Rewards Store', 'gameengine')}
                rightContent={
                    <div className="flex items-center gap-2">
                        <WhatsNew />
                        <GetHelp filterText={['rewards']} />
                    </div>
                }
            />

            <div className="gameengine-page-content">
                <RewardsTable />
            </div>
        </>
    );
};

export default RewardsStore;
