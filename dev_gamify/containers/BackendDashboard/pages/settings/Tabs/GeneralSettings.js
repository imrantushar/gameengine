import React, { useEffect } from 'react';
import { Box, Checkbox, Flex, Input, Separator, Text, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import LabeledInput from '@GFComponents/LabeledInput';
import { fetchSettings, setGeneralField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';
import Select from "react-select";
import { useFormikContext } from 'formik';

const displaycicle = [
    {
        label: __('Immediate', 'gamify'),
        value: 'immediate',
    },
    {
        label: __('After 24 Hours', 'gamify'),
        value: 'daily',
    },
    {
        label: __('After 7 Days', 'gamify'),
        value: 'weekly',
    },
]

const retentionDays = [
    {
        label: __('Never', 'gamify'),
        value: '0',
    },
    {
        label: __('30 Days', 'gamify'),
        value: '30',
    },
    {
        label: __('90 Days', 'gamify'),
        value: '90',
    },
]

const GeneralSettings = () => {
    const {values, setFieldValue} = useFormikContext();
    const { general } = values;

    return (
        <SettingsInner heading={__("General Settings", "gamify")}>
            <Flex direction="column" gap='16px'>
                <GFLabel type="title" label={__("Level Image Size", "gamify")} />

                <GamifyInput 
                    label={__("Log Display", "gamify")} 
                    width="100%" 
                    direction={'row'}
                    justifyContent="space-between"
                >
                    <Select
                        className="gamify-select gamify-select--300"
                        classNamePrefix="gamify-select"
                        options={displaycicle}
                        value={
                            displaycicle?.find(
                            opt => opt.value === values?.display_cycle
                            ) || null
                        }
                        onChange={option => {
                            setFieldValue('display_cycle', option.value)
                        }}
                        menuPlacement="bottom"
                    />
                </GamifyInput>

                <GamifyInput 
                    label={__("Auto Cleanup", "gamify")}
                    width="100%" 
                    direction={'row'}
                    justifyContent="space-between"
                >
                    <Select
                        className="gamify-select gamify-select--300"
                        classNamePrefix="gamify-select"
                        options={retentionDays}
                        value={
                            retentionDays?.find(
                            opt => Number(opt.value) === Number(values?.retention_days)
                            ) || null
                        }
                        onChange={option => {
                            setFieldValue('retention_days', option.value)
                        }}
                        menuPlacement="bottom"
                    />
                </GamifyInput>

                <GFLabel type="title" label={__("Log Levels", "gamify")} />
                <Separator />
                <GamifyInput 
                    label={__("Enable successful rewards", "gamify")}
                    width="100%" 
                    direction={'row'}
                    justifyContent="space-between"
                >
                    <Checkbox.Root
                        size="sm"
                        mt="0.5"
                        aria-label="Select row"
                        checked={values?.log_levels?.includes('success')}
                        onCheckedChange={(changes) => {
                            if(changes.checked) {
                                setFieldValue('log_levels', values.log_levels.filter(item => item !== 'success'))
                            } else {
                                setFieldValue('log_levels', [...values.log_levels, 'success'])
                            }
                        }}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                    </Checkbox.Root>
                </GamifyInput>
                <GamifyInput 
                    label={__("Enable System Errors", "gamify")}
                    width="100%" 
                    direction={'row'}
                    justifyContent="space-between"
                >
                    <Checkbox.Root
                        size="sm"
                        mt="0.5"
                        aria-label="Select row"
                        checked={values?.log_levels?.includes('error')}
                        onCheckedChange={(changes) => {
                            if(changes.checked) {
                                setFieldValue('log_levels', values.log_levels.filter(item => item !== 'error'))
                            } else {
                                setFieldValue('log_levels', [...values.log_levels, 'error'])
                            }
                        }}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                    </Checkbox.Root>
                </GamifyInput>
            </Flex>
        </SettingsInner>
    );
};

export default GeneralSettings;
