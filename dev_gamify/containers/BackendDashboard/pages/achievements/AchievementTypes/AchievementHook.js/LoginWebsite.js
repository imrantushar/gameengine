import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import GFSelect from "@Components/Select";
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import LabeledInput from '@Components/LabeledInput';
import Divider from '@Components/Divider';

const LoginWebsite = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Box>
            <CustomCollapsible
                label="Login to website"
                desc="Award points for logging in."
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                singleIcon={true}
            >
                <Flex gap='12px'>
                    <GFSelect
                        style={{ width: '50%' }}
                        label="Achievement Type"
                        placeholder="Choose one"
                        items={[
                            { label: 'Unlimited', value: 'unlimited' },
                            { label: '1 per day', value: '1_per_day' },
                            { label: '1 time only', value: '1_time' },
                        ]}
                    // value={}
                    // onChange={(opt) => }
                    />
                    <LabeledInput
                        style={{ width: '50%' }}
                        label="Points"
                        placeholder="100"
                        type="number"
                    // value={}
                    // onChange={(e) => }

                    />

                </Flex>
                <Flex gap='12px'>
                    <LabeledInput
                        style={{ width: '50%' }}
                        label="Limit"
                        placeholder="5"
                        type="number"
                    // value={}
                    // onChange={(e) => }

                    />
                    <GFSelect
                        style={{ width: '50%' }}
                        label="Times"
                        placeholder="Month"
                        items={[
                            { label: 'Month', value: 'month' },
                            { label: 'Year', value: 'year' },
                            { label: 'Day', value: 'day' },
                        ]}
                    // value={}
                    // onChange={}
                    />
                </Flex>
                <Divider width='500px' margin='24px -16px 24px -16px' />

                <Flex
                    justifyContent='flex-end'>
                    <Button
                        {...primaryBtn}
                        width='63px'

                    >
                        {__('Save', 'gamify')}
                    </Button>
                </Flex>
            </CustomCollapsible>

        </Box>
    );
}

export default LoginWebsite;