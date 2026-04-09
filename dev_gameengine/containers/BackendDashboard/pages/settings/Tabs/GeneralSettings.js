import React from 'react';
import { Box, Flex, Switch, Text } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
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
        <Box width={'100%'} overflow="visible">
            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible">
                <Text
                    fontSize="20px"
                    fontWeight="500"
                    color="var(--gameengine-font-color)"
                    lineHeight="30px"
                    margin='0 0 24px 0' 
                    padding='0 0 16px 0'
                    borderBottom="1px solid var(--gameengine-border-color)"
                >
                    {__("Log", "gameengine")}
                </Text>

                <Flex direction="column" gap='16px'>
                    <SettingsInput label={__("Log Display", "gameengine")}
                        subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Choose how activity logs are processed. Select "Immediate" to record and display log entries as soon as they occur.', 'gameengine')} />}
                    >
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
                            menuPlacement="auto"
                        />
                    </SettingsInput>

                    <SettingsInput label={__("Auto Cleanup", "gameengine")}
                        subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Automatically remove old activity logs from the database after a specific period to keep your database optimized and improve performance.', 'gameengine')} />}
                    >
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
                            menuPlacement="auto"
                        />
                    </SettingsInput>
                </Flex>
            </GameEngineBox>

            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" mt="24px">
                <Text
                    fontSize="20px"
                    fontWeight="500"
                    color="var(--gameengine-font-color)"
                    lineHeight="30px"
                    margin='0 0 24px 0' 
                    padding='0 0 16px 0'
                    borderBottom="1px solid var(--gameengine-border-color)"
                >
                    {__("Economy", "gameengine")}
                </Text>

                <Flex direction="column" gap='16px'>
                    <SettingsInput label={__("Enable successful rewards", "gameengine")}
                        subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Enable this to record a log entry every time a user successfully earns points, achievements, or levels.', 'gameengine')} />}
                    >
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

                    <SettingsInput label={__("Enable System Errors", "gameengine")}
                        subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Enable this to track and record failed reward attempts or system-level errors to help diagnose potential issues.', 'gameengine')} />}
                    >
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
    );
};

export default GeneralSettings;
