import { Box, Button, Flex, Text, VStack, Link } from '@chakra-ui/react';
import React from 'react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import Divider from '@GFComponents/Divider';
import SettingsInner from '../Components/SettingsInner';

const HelpSupport = () => {
    return (
        <SettingsInner heading={__(`Help & Support`, "gameengine")}>
            <VStack padding='32px' width="100%" align="stretch" gap='16px'>
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`General Settings`, 'gameengine')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`GameEngine Pro is a powerful WordPress gamification plugin that boosts user engagement with points, badges, and leaderboards.`, 'gameengine')}</Text>
                </Box>
                <Divider width='100%' />

                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Documentation:`, 'gameengine')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`For complete information about GameEngine pro and its collection of add-ons, visit the. `, 'gameengine')}
                        <Link color="var(--gameengine-primary)" href="#" variant="underline">{__(` official documentation.`, 'gameengine')}</Link></Text>
                </Box>
                <Divider width='100%' />
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Help/Support:`, 'gameengine')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`Connect with us for support or feature enhancements - myCred Support Forums or `, 'gameengine')}
                        <Link color="var(--gameengine-primary)" href="#" variant="underline">{__(`Open a support ticket.`, 'gameengine')}</Link></Text>
                </Box>
                <Divider width='100%' />
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`add-ons:`, 'gameengine')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`Enjoy the best that GameEngine Pro has to offer with our collection of premium add-ons that enable you to perform complex tasks such as create a points management system for your all sites `, 'gameengine')}
                        <Link color="var(--gameengine-primary)" href="#" variant="underline">{__(`View our premium add-ons.`, 'gameengine')}</Link></Text>
                </Box>
                <Divider width='100%' />
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Customization:`, 'gameengine')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`If you need to build a custom feature, simply `, 'gameengine')}
                        <Link color="var(--gameengine-primary)" href="#" variant="underline">{__(`submit a request`, 'gameengine')}</Link>{__(`If you need to build a custom feature, simply `, 'gameengine')}</Text>
                </Box>
                <Divider width='100%' />
                <Text fontSize="14px"
                    fontWeight='400'
                    textAlign="center"
                    margin='0'>{__(`Or if you don't want to use the automatic service, click here to use the regular servic `, 'gameengine')}
                    <Link color="var(--gameengine-primary)" href="#" variant="underline">{__(` visit website.`, 'gameengine')}</Link>
                    </Text>


            </VStack>
        </SettingsInner>
    );
};

export default HelpSupport;