import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import LabeledInput from '@Components/LabeledInput';
import GFSelect from "@Components/Select";

const PointsLogins = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Box>
            <CustomCollapsible
                label="Points for Logins"
                desc="Award points for logging in."
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                singleIcon={true}
            >
                <Flex gap='12px' >
                    <LabeledInput
                        label="Points"
                        placeholder="100"
                        type='number'
                    />
                    <GFSelect
                        label="Choose the Points Type"
                        placeholder="Choose one"
                        items={[
                            { label: "React.js", value: "react" },
                            { label: "Vue.js", value: "vue" },
                            { label: "Angular", value: "angular" },
                            { label: "Svelte", value: "svelte" },
                        ]}
                    />
                </Flex>
                <LabeledInput
                    label="Label"
                    placeholder="ABC"

                />
                <LabeledInput
                    label="Url"
                    placeholder="gdreyt.net"
                    type="url"

                />
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

        </Box>
    );
}

export default PointsLogins;