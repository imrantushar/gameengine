import React from 'react';
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailNotice from './Tabs/EmailNotice';
import HelpSupport from './Tabs/HelpSupport';
import { FaChevronRight } from 'react-icons/fa6';



const Settings = () => {
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const tab = tabMatch ? tabMatch[1] : 'general-settings';
    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
                            <path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
                        </svg>
                        </span>
                        <span className="gamify-icon gamify-icon--angle-right"> <FaChevronRight />
                        </span>
                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="400" 
                            fontSize='12px'
                            label={__("Dashboard", "gamify")}
                        />
                    </>
                )}
            />
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
