import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import GFLabel from '@Components/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import Divider from '@Components/Divider';
import LabeledInput from '@Components/LabeledInput';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import GFSelect from "@Components/Select";

const EmailNotice = () => {
    return (
        <Box
            w="240px"
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
                <GFLabel
                    type="heading"
                    fontWeight="500"
                    label={__(`Email Notification`, 'gamify')}
                />
                <Divider width='100%' />
                <GFSelect
                    label="Format"
                    placeholder="Plain Text"
                    items={[
                        { label: 'Unlimited', value: 'unlimited' },
                        { label: '1 per day', value: '1_per_day' },
                        { label: '1 time only', value: '1_time' },
                    ]}
                // value={}
                // onChange={(opt) => }
                />
                <GFSelect
                    label="Schedule"
                    placeholder="Send mails immediately"
                    items={[
                        { label: 'Unlimited', value: 'unlimited' },
                        { label: '1 per day', value: '1_per_day' },
                        { label: '1 time only', value: '1_time' },
                    ]}
                // value={}
                // onChange={(opt) => }
                />
                <LabeledInput
                    label="From Name"
                    placeholder="StoreEngine"
                    type="text"
                // value={}
                // onChange={(e) => }

                />
                <LabeledInput
                    label="From Address"
                    placeholder="dev-email@wpengine.local"
                    type="text"
                // value={}
                // onChange={(e) => }

                />
                <LabeledInput
                    label="Default Email Content"
                    placeholder="Enter content..."
                    type="textarea"
                   inputStyle={{height:'80px'}}
                // value={}
                // onChange={(e) => }

                />

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

export default EmailNotice;