import React, { useEffect } from 'react';
import { Box, Checkbox, Flex, Input, Separator, Switch, Text, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import LabeledInput from '@GFComponents/LabeledInput';
import { fetchSettings, setGeneralField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import GameEngineInput from '@GFComponents/GameEngineInput';

import Select from "react-select";
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const displaycicle = [
    {
        label: __('Immediate', 'gameengine'),
        value: 'immediate',
    },
    {
        label: __('After 24 Hours', 'gameengine'),
        value: 'daily',
    },
    {
        label: __('After 7 Days', 'gameengine'),
        value: 'weekly',
    },
]

const retentionDays = [
    {
        label: __('Never', 'gameengine'),
        value: '0',
    },
    {
        label: __('30 Days', 'gameengine'),
        value: '30',
    },
    {
        label: __('90 Days', 'gameengine'),
        value: '90',
    },
]

const GeneralSettings = () => {

    const { values, setFieldValue } = useFormikContext();

    return (
        <>
            <Box >
                <GameEngineBox  dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)">
                    <GFLabel type="heading" margin='0 0 24px 0' padding='0 0 16px 0' label={__("Log ", "gameengine")} />

                    <Flex direction="column" gap='16px'>
                        <SettingsInput label={__("Log Display", "gameengine")}>
                            <Select
                                className="gameengine-select gameengine-select--300"
                                classNamePrefix="gameengine-select"
                                options={displaycicle}
                                value={
                                    displaycicle?.find(
                                        opt => opt.value === values?.logs?.display_cycle
                                    ) || null
                                }
                                onChange={option => {
                                    setFieldValue('logs.display_cycle', option.value)
                                }}
                                menuPlacement="bottom"
                            />
                        </SettingsInput>

                        <SettingsInput label={__("Auto Cleanup", "gameengine")}>
                            <Select
                                className="gameengine-select gameengine-select--300"
                                classNamePrefix="gameengine-select"
                                options={retentionDays}
                                value={
                                    retentionDays?.find(
                                        opt => Number(opt.value) === Number(values?.logs?.retention_days)
                                    ) || null
                                }
                                onChange={option => {
                                    setFieldValue('logs.retention_days', option.value)
                                }}
                                menuPlacement="bottom"
                            />
                        </SettingsInput>
                    </Flex>
                </GameEngineBox>


                <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" mt="24px">
                    <GFLabel type="heading" margin='0 0 24px 0' padding='0 0 16px 0' label={__(" Economy", "gameengine")} />

                    <Flex direction="column" gap='16px'>
                        <SettingsInput label={__("Enable successful rewards", "gameengine")}>
                            <Switch.Root
                                colorPalette="blue"
                                size="sm"
                                mt="0.5"
                                aria-label="Select row"
                                checked={values?.logs?.log_levels?.includes('success')}
                                onCheckedChange={(changes) => {
                                    if (changes.checked) {
                                        setFieldValue('logs.log_levels', [...values?.logs?.log_levels, 'success'])
                                    } else {
                                        setFieldValue('logs.log_levels', values?.logs?.log_levels.filter(item => item !== 'success'))
                                    }
                                }}
                            >
                                <Switch.HiddenInput />
                                <Switch.Control />
                            </Switch.Root>
                        </SettingsInput>

                        <SettingsInput label={__("Enable System Errors", "gameengine")}>
                            <Switch.Root
                                colorPalette="blue"
                                size="sm"
                                mt="0.5"
                                aria-label="Select row"
                                checked={values?.logs?.log_levels?.includes('error')}
                                onCheckedChange={(changes) => {
                                    if (changes.checked) {
                                        setFieldValue('logs.log_levels', [...values?.logs?.log_levels, 'error'])
                                    } else {
                                        setFieldValue('logs.log_levels', values?.logs?.log_levels.filter(item => item !== 'error'))
                                    }
                                }}
                            >

                                <Switch.HiddenInput />
                                <Switch.Control />
                            </Switch.Root>
                        </SettingsInput>
                    </Flex>
                </GameEngineBox>

            </Box>
        </>
    );
};

export default GeneralSettings;
