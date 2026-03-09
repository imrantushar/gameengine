import React, { useEffect, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Button, Flex, Box } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { fetchSettings, saveSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import GetHelp from '@GFComponents/GetHelp';
import SettingsLoader from '@GFComponents/GameEngineLoader/SettingsLoader';
import GFLabel from '@GFComponents/Labels/GFLabel';
import GameEngineBox from '@GFComponents/GameEngineBox';
import Economy from './Tabs/Economy';
import MarketPlace from './Tabs/MarketPlace';
import Payout from './Tabs/Payout';
import Dashboard from './Tabs/Dashboard';

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'dashboard';
    const { data: settingsData } = useSelector(state => state.settings);
    const [settingsLoading, setSettingsLoading] = useState(!settingsData);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!settingsData) {
            setSettingsLoading(true)
            dispatch(fetchSettings()).then(() => {
                setSettingsLoading(false)
            });
        }
    }, [])

    const onSubmitHandle = (values, actions) => {
        actions.setSubmitting(true);
        try {
            switch (tab) {
                case "general-settings":
                case "log":
                    return dispatch(saveSettings({ key: 'logs', payloadData: values.logs }));
                case "economy":
                    return dispatch(saveSettings({ key: 'economy', payloadData: values.economy }));
                case "marketplace":
                    return dispatch(saveSettings({ key: 'marketplace', payloadData: values.marketplace }));
                case "payout":
                    return dispatch(saveSettings({ key: 'payout', payloadData: values.payout }));
                case "dashboard":
                    return dispatch(saveSettings({key: 'dashboard', payloadData: values.dashboard}));
                default:
                    return null;
            }
        } catch (error) {
            console.warn({ error })
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <>
            {settingsLoading ? (
                <SettingsLoader />
            ) : (
                <Formik
                    enableReinitialize
                    initialValues={settingsData}
                    onSubmit={onSubmitHandle}
                >
                    {({ handleSubmit, isSubmitting, dirty }) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Settings", "gameengine")}
                                    rightContent={
                                        <>
                                            <Button {...primaryBtn} onClick={handleSubmit} loading={isSubmitting} disabled={!dirty}>
                                                {__('Save Changes', 'gameengine')}
                                            </Button>
                                            <GetHelp filterText={['setting']} />
                                        </>
                                    }
                                />

                                <Box className='gameengine-page-content'>
                                    <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                                        <GFLabel type="plainHeading" margin={0} label={__("Settings", "gameengine")} />
                                    </Flex>

                                    <Flex gapX={4} alignItems={'flex-start'} width={'100%'}>

                                        <LeftBar />
                                        <Box width={'100%'} key={tab} className="gameengine-fade-in">
                                            {tab === "log" && <GeneralSettings /> }
                                            {tab === "economy" && <Economy />}
                                            {tab === "marketplace" && <MarketPlace />}
                                            {tab === "payout" && <Payout />}
                                        </Box>

                                    </Flex>
                                </Box>

                            </>
                        )
                    }}
                </Formik>
            )}
        </>
    );
};

export default Settings;
