import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import GFSelect from "@Components/Select";
import LabeledInput from '@Components/LabeledInput';
const DeductsLogins = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for Logins"
            desc="The user loses points for logging in."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex gap='12px' >
                
                <LabeledInput
                    label="Deducts"
                    placeholder="05"
                    type='number'
                    style={{width:"30%"}}
                />
                <LabeledInput
                    label="Limit"
                    placeholder="10"
                    type='number'
                    style={{width:"30%"}}
                />
                <GFSelect
                    style={{width:"40%"}}
                    label="Point Name"
                    placeholder="Choose one"
                    items={[
                        { label: "React.js", value: "react" },
                        { label: "Vue.js", value: "vue" },
                        { label: "Angular", value: "angular" },
                        { label: "Svelte", value: "svelte" },
                    ]}
                />
            </Flex>
            <Flex
                padding="24px 0"
                justifyContent='flex-end'>
                <Button
                    {...primaryBtn}
                    width='63px'

                >
                    {__('Save', 'gamify')}
                    
                </Button>
            </Flex>
        </CustomCollapsible>
    );
}

export default DeductsLogins;