import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@Components/Labels/GFLabel';
import Select from 'react-select';
import CustomCollapsible from '@Components/Collapsible';
import TopBar from '@Components/TopBar';
import { FaArrowRotateRight } from 'react-icons/fa6';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import LabeledInput from '@Components/LabeledInput';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import Divider from '@Components/Divider';
import { Switch } from "@chakra-ui/react"
import GFSelect from '@Components/Select';
const AchievementsType = () => {


    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                        <span className="gamify-icon gamify-icon--angle-right"></span>
                        <GFLabel as="h2" color="#4F46E5" type="subtitle" fontWeight="medium" label={__("Dashboard", "gamify")} />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto">
                <Flex
                    width="100%"
                    direction="column"
                    bg="var(--gamify-background)"
                    p={6}
                    borderRadius="4px"
                    boxShadow="var(--gamify-shadow)"
                    gap={6}
                >
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Achievement Types`, 'gamify')}
                    />

                    <LabeledInput
                        label="Point Name"
                        placeholder="Academy Lms"
                    />

                    <LabeledInput
                        label="Plural Name"
                        placeholder="Plural Name"
                    />
                    <Box>
                        <LabeledInput
                            label="Earned By"
                            placeholder="Completing Steps"
                        />
                        <GFLabel
                            type="miniTitle"
                            label={__("How this achievement can be earned.", "gamify")}
                            fontSize="0.875rem"
                            margin="6px 0 0 0"
                            color="var(--gamify-secondary)"
                        />

                    </Box>
                    <Box>
                        <LabeledInput
                            label="Maximum Earnings Per User :"
                            placeholder="Completing Steps"
                        />
                        <GFLabel
                            type="miniTitle"
                            label={__("Number of times a user can earn this badge (set it to 0 for no maximum).", "gamify")}
                            fontSize="0.875rem"
                            margin="6px 0 0 0"
                            color="var(--gamify-secondary)"
                        />

                    </Box>
                    <Flex>
                        <Switch.Root>
                            <Switch.HiddenInput />
                            <Switch.Label>{__("Allow unlock with points", "gamify")}</Switch.Label>
                            <Switch.Control
                                _checked={{
                                    bg: "var(--gamify-primary)",
                                }} />
                        </Switch.Root>

                    </Flex>
                    <Flex gap='12px'>
                        <Box width="50%">
                        <LabeledInput
                            label="Points"
                            placeholder="1500"
                            type="number"
                        />
                        </Box>
                        <Box width="50%">
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
                        </Box>
                    </Flex>
                    <Flex
                        padding="24px 0"
                        justifyContent='flex-end'
                        borderTop='1px solid var(--gamify-border-color)'>

                        <Button
                            {...primaryBtn}
                            width='121px'

                        >
                            {__('Save Changes', 'gamify')}
                        </Button>
                    </Flex>
                </Flex >
            </Box >

        </>
    );
};

export default AchievementsType;
