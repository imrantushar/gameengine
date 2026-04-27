import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ReferralsStats from './ReferralsStats';
import ReferralsTable from './ReferralsTable';
import { fetchReferralStats } from '@GFRedux/Slices/referralSlice/referralSlice';

const Referrals = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchReferralStats());
    }, []);

    return (
        <>
            <TopBar path={__("Referrals", "gameengine")} />

            <div className='gameengine-page-content'>
                <div className='flex justify-between items-center py-6'>
                    <GFLabel type="plainHeading" margin={0} label={__("Referral & Affiliate", "gameengine")} />
                </div>

                <ReferralsStats />
                <ReferralsTable />
            </div>
        </>
    );
};

export default Referrals;
