import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import GFLabel from '@Components/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import Divider from '@Components/Divider';
import LabeledInput from '@Components/LabeledInput';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

const GeneralSettings = () => {
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
                <GFLabel
                    type="heading"
                    fontWeight="500"
                    label={__(`General Settings`, 'gamify')}
                />
                <Divider width='100%' />
                <GFLabel
                    type="inputLevel"
                    label={__(`Level Image Size`, 'gamify')}
                    fontWeight='500'
                    fontSize='14px'
                />
                <Box>
                    <Flex gap='64px'>
                        <LabeledInput
                            label="Max Width"
                            placeholder="1"
                            type='number'
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                            inputStyle={{ width: '74px', height: '25px' }}


                        />
                        <LabeledInput
                            label="Max Height"
                            placeholder="2"
                            type='number'
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                            inputStyle={{ width: '74px', height: '25px' }}


                        />
                    </Flex>
                    <Text fontSize="0.875rem" margin='6px 0 0 0' color='var(--gamify-secondary)'>
                        {__('Maximum dimensions for ranks featured image.', 'gamify')}
                    </Text>
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

export default GeneralSettings;