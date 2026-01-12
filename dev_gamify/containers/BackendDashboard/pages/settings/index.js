import React from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailNotice from './Tabs/EmailNotice';
import HelpSupport from './Tabs/HelpSupport';

const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'general-settings';

    return (
        <>
            <TopBar path={__("Settings", "gamify")} />

            <Flex width="1174px" margin="0 auto" height="100vh">
                <LeftBar />
                <Box padding='0 16px'>
                    {tab === "general-settings" && <GeneralSettings />}
                    {tab === "email-notice" && <EmailNotice />}
                    {tab === "help-support" && <HelpSupport />}
                </Box>
            </Flex>
        </>
    );
};

export default Settings;
