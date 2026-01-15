import React, { useEffect } from 'react';
import { Button, Flex, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import LabeledInput from '@GFComponents/LabeledInput';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { fetchSettings, setEmailField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import GamifyInput from '@GFComponents/GamifyInput';
import { useFormikContext } from 'formik';

const EmailNotice = () => {
    const {values, setFieldValue} = useFormikContext();
    const { email } = values;

    // Helper options
    const formatOptions = [
        { label: __('Plain Text', 'gamify'), value: 'plain' },
        { label: __('HTML', 'gamify'), value: 'html' }
    ];

    const scheduleOptions = [
        { label: __('Immediate', 'gamify'), value: 'immediate' },
        { label: __('Daily Digest', 'gamify'), value: 'daily' }
    ];

    return (
        <SettingsInner heading={__(`Email Notification`, "gamify")}>
            <Flex direction="column" gap='16px'>
                <GamifyInput label={__("Format", "gamify")}>
                    <Select
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        placeholder="Choose one"
                        options={formatOptions}
                        value={formatOptions.find(opt => opt?.value === email?.format)}
                        onChange={(opt) => setFieldValue('email.format', opt.value)}
                    />
                </GamifyInput>

                <GamifyInput label={__("Schedule", "gamify")}>
                    <Select
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        placeholder="Choose one"
                        options={scheduleOptions}
                        value={scheduleOptions.find(opt => opt?.value === email?.schedule)}
                        onChange={(opt) => setFieldValue('email.schedule', opt.value)}
                    />
                </GamifyInput>

                <GamifyInput label={__("From Name", "gamify")}>
                    <Input
                        placeholder={__("Enter from name", "gamify")}
                        value={email?.from_name || ''}
                        onChange={(e) => setFieldValue('email.from_name',e.target.value )}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput label={__("From Address", "gamify")}>
                    <Input
                        placeholder={__("Enter from address", "gamify")}
                        value={email?.from_address || ''}
                        onChange={(e) => setFieldValue('email.from_address',e.target.value )}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput label={__("Default Email Content", "gamify")}>
                    <Textarea
                        placeholder={__("Enter email content", "gamify")}
                        value={email?.default_content || ''}
                        onChange={(e) => setFieldValue('email.default_content', e.target.value)}
                    />
                </GamifyInput>

                <Text fontSize="12px" color="gray.500" mt="-10px">
                    {__('Available placeholders: {user_name}, {level_name}, {site_name}', 'gamify')}
                </Text>
            </Flex>
        </SettingsInner>
    );
};

export default EmailNotice;
