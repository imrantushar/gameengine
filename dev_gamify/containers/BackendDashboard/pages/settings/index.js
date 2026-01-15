import React, { useEffect } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Button, Flex } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailNotice from './Tabs/EmailNotice';
import HelpSupport from './Tabs/HelpSupport';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { saveSettings, fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'general-settings';
    const dispatch = useDispatch();
    const { email, general, saveStatus, status } = useSelector(state => state.settings);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSettings());
        }
    }, [dispatch, status]);

    const handleSave = () => {
        switch (tab) {
            case "general-settings":
                dispatch(saveSettings({ general }));
                break;

            case "email-notice":
                dispatch(saveSettings({ email }));
                break;

            default:
                break;
        }
    };

    return (
        <>
            <TopBar
                path={__("Settings", "gamify")}
                rightContent={
                    <Button {...primaryBtn} onClick={handleSave} isLoading={saveStatus === 'saving'}>
                        {__('Save Changes', 'gamify')}
                    </Button>
                }
            />

            <Flex alignItems="flex-start" gap="16px" className='gamify-page-content'>
                <LeftBar />

                {tab === "general-settings" && <GeneralSettings saveStatus={saveStatus} status={status} general={general} />}
                {tab === "email-notice" && <EmailNotice saveStatus={saveStatus} status={status} email={email} />}
                {tab === "help-support" && <HelpSupport />}
            </Flex>
        </>
    );
};

export default Settings;
