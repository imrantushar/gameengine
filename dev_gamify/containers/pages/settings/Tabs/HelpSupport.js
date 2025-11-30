import { Box, Button, Flex, Text, VStack ,Link } from '@chakra-ui/react';
import React from 'react';
import GFLabel from '@Components/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import Divider from '@Components/Divider';
import LabeledInput from '@Components/LabeledInput';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

const HelpSupport = () => {
    return (
        <Box
            bg="var(--gamify-background)"
            borderRight="1px solid var(--gamify-border-color)"
            h="auto"
            pos="sticky"
            top="0"
            display={{ base: "none", lg: "flex" }}
            flexDirection="column"
            borderRadius='4px'
            minWidth='802px'
        >
            <VStack padding='32px' width="100%" align="stretch" gap='16px'>
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`General Settings`, 'gamify')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`Gamify Pro is a powerful WordPress gamification plugin that boosts user engagement with points, badges, and leaderboards.`, 'gamify')}</Text>
                </Box>
                <Divider width='100%' />
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Documentation:`, 'gamify')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`For complete information about Gamify pro and its collection of add-ons, visit the. `, 'gamify')}
                        <Link href="#" variant="underline">{__(` official documentation.`, 'gamify')}</Link></Text>
                </Box>
                <Divider width='100%' />
                 <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Help/Support:`, 'gamify')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`Connect with us for support or feature enhancements - myCred Support Forums or `, 'gamify')}
                        <Link href="#" variant="underline">{__(`Open a support ticket.`, 'gamify')}</Link></Text>
                </Box>
                <Divider width='100%' />
                 <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`add-ons:`, 'gamify')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`Enjoy the best that Gamify Pro has to offer with our collection of premium add-ons that enable you to perform complex tasks such as create a points management system for your all sites `, 'gamify')}
                        <Link href="#" variant="underline">{__(`View our premium add-ons.`, 'gamify')}</Link></Text>
                </Box>
                <Divider width='100%' />
                <Box>
                    <GFLabel
                        type="title"
                        fontWeight="600"
                        fontSize='16px'
                        label={__(`Customization:`, 'gamify')}
                    />
                    <Text fontSize="14px"
                        fontWeight='400'
                        margin='0'>{__(`If you need to build a custom feature, simply `, 'gamify')}
                        <Link href="#" variant="underline">{__(`submit a request`, 'gamify')}</Link>{__(`If you need to build a custom feature, simply `, 'gamify')}</Text>
                </Box>

                <Flex
                    justifyContent='flex-end'>
                    <Button
                        {...primaryBtn}


                    >
                        {__('Save Changes', 'gamify')}
                    </Button>
                </Flex>


            </VStack>
        </Box>
    );
};

export default HelpSupport;