import React, { useEffect, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Button, Flex } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailNotice from './Tabs/EmailNotice';
import HelpSupport from './Tabs/HelpSupport';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { fetchSettings, saveSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import GetHelp from '@GFComponents/GetHelp';
import SettingsLoader from '@GFComponents/GamifyLoader/SettingsLoader';

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'general-settings';
    const { data: settingsData } = useSelector(state => state.settings);
    const [settingsLoading, setSettingsLoading] = useState(!settingsData);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!settingsData) {
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
                    return dispatch(saveSettings({key: 'logs', payloadData: values.logs}));
                // case "email-notice":
                //     return dispatch(saveSettings({key: 'email', data: values?.email}));
            }
        } catch (error) {
            console.warn({error})
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
                    {({submitForm, isSubmitting, dirty}) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Settings", "gamify")}
                                    rightContent={
                                        <>
                                            <Button {...primaryBtn} onClick={submitForm} loading={isSubmitting} disabled={!dirty}>
                                                {__('Save Changes', 'gamify')}
                                            </Button>
                                            <GetHelp filterText={['setting']} />
                                        </>
                                    }
                                />
                                
                                <Flex alignItems="flex-start" justifyContent={'center'} gap="16px" className='gamify-page-content'>
                                    <GeneralSettings />
                                    {/* <LeftBar /> */}
                                    {/* {tab === "general-settings" && <GeneralSettings />} */}
                                    {/* {tab === "email-notice" && <EmailNotice />}
                                    {tab === "help-support" && <HelpSupport />} */}
                                </Flex>
                            </>
                        )
                    }}
                </Formik>
            )}
        </>
    );
};

export default Settings;
