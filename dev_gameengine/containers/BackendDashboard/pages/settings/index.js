import React, { useEffect, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Button, Flex, Box } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailNotice from './Tabs/EmailNotice';
import HelpSupport from './Tabs/HelpSupport';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { fetchSettings, saveSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import GetHelp from '@GFComponents/GetHelp';
import SettingsLoader from '@GFComponents/GameEngineLoader/SettingsLoader';
import GFLabel from '@GFComponents/Labels/GFLabel';
import GameEngineBox from '@GFComponents/GameEngineBox';
import Log from './Tabs/log';
import Economy from './Tabs/Economy';

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'general-settings';
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
                    return dispatch(saveSettings({ key: 'logs', payloadData: values.logs }));
                // case "email-notice":
                //     return dispatch(saveSettings({key: 'email', data: values?.email}));
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
                    {({ submitForm, isSubmitting, dirty }) => {

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

                                <Box>
                                    <GFLabel type="plainHeading" margin={0} padding='24px 0' label={__("Settings", "gameengine")} />

                                    <Flex direction='row' gapX={6}    className='gameengine-page-content'>

                                        {/* <GeneralSettings /> */}

                                        <LeftBar />
                                        {tab === "log" && <Log /> }
                                        {tab === "economy" && <Economy />}

                                        {/* {tab === "general-settings" && <GeneralSettings />} */}


                                        {/* {tab === "email-notice" && <EmailNotice />}
                                    {tab === "help-support" && <HelpSupport />} */}

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
