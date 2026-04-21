import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Box, Flex } from '@chakra-ui/react';
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

            <Box className='gameengine-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Referral & Affiliate", "gameengine")} />
                </Flex>

                <ReferralsStats />
                <ReferralsTable />
            </Box>
        </>
    );
};

export default Referrals;
