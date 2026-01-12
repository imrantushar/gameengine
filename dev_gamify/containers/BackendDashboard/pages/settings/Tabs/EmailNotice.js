import React, { useEffect } from 'react';
import { Button, Flex, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import LabeledInput from '@GFComponents/LabeledInput';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { fetchSettings, setEmailField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from './Components/SettingsInner';
import { useDispatch } from 'react-redux';
import GamifyInput from '@GFComponents/GamifyInput';

const EmailNotice = ({ saveStatus, status, email }) => {
    const dispatch = useDispatch();
    // useEffect(() => {
    //     if (status === 'idle') {
    //         dispatch(fetchSettings());
    //     }

    //     // 🔥 FIX: Reset status when component mounts/unmounts
    //     return () => {
    //         dispatch(resetSaveStatus());
    //     };
    // }, [dispatch, status]);

    // Helper options
    const formatOptions = [
        { label: 'Plain Text', value: 'plain' },
        { label: 'HTML', value: 'html' }
    ];

    const scheduleOptions = [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Daily Digest', value: 'daily' }
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
                        value={formatOptions
                            .find(opt => opt?.value === email?.format)}
                        onChange={(opt) => dispatch(setEmailField({ field: 'format', value: opt ? opt.value : 'plain' }))}
                    />
                </GamifyInput>

                <GamifyInput label={__("Schedule", "gamify")}>
                    <Select
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        placeholder="Choose one"
                        options={scheduleOptions}
                        value={scheduleOptions.find(opt => opt?.value === email?.schedule)}
                        onChange={(opt) => dispatch(setEmailField({ field: 'schedule', value: opt ? opt.value : 'immediate' }))}
                    />
                </GamifyInput>

                <GamifyInput label={__("From Name", "gamify")}>
                    <Input
                        placeholder={__("Enter from name", "gamify")}
                        value={email?.from_name || ''}
                        onChange={(e) => dispatch(setEmailField({ field: 'from_name', value: e.target.value }))}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput label={__("From Address", "gamify")}>
                    <Input
                        placeholder={__("Enter from address", "gamify")}
                        value={email?.from_address || ''}
                        onChange={(e) => dispatch(setEmailField({ field: 'from_address', value: e.target.value }))}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput label={__("Default Email Content", "gamify")}>
                    <Textarea
                        placeholder={__("Enter email content", "gamify")}
                        value={email?.default_content || ''}
                        onChange={(e) => dispatch(setEmailField({ field: 'default_content', value: e.target.value }))}
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
