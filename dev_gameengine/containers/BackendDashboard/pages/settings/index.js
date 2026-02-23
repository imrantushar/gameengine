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

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'log';
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
                // case "email-notice":
                //     return dispatch(saveSettings({key: 'email', data: values?.email}));
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
                    {({values, submitForm, isSubmitting, dirty }) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Settings", "gameengine")}
                                    rightContent={
                                        <>
                                            <Button {...primaryBtn} onClick={submitForm} loading={isSubmitting} disabled={!dirty}>
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
                                        {tab === "log" && <GeneralSettings /> }
                                        {tab === "economy" && <Economy />}
                                        {tab === "marketplace" && <MarketPlace />}

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
