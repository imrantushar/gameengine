import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import Divider from '@GFComponents/Divider';
import LabeledInput from '@GFComponents/LabeledInput';
import GFSelect from "@GFComponents/Select";
import Select from 'react-select';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { fetchSettings, saveSettings, setEmailField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';

const EmailNotice = () => {
    const dispatch = useDispatch();
    const { email, saveStatus, status } = useSelector(state => state.settings);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSettings());
        }

        // 🔥 FIX: Reset status when component mounts/unmounts
        return () => {
            dispatch(resetSaveStatus());
        };
    }, [dispatch, status]);

    // Handle Save Feedback
    useEffect(() => {
        if (saveStatus === 'saved') {
            alert(__("Email settings saved successfully!", "gamify"));
            // Reset immediately after showing alert
            dispatch(resetSaveStatus());
        }
    }, [saveStatus, dispatch]);

    const handleSave = () => {
        dispatch(saveSettings({ email }));
    };

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
        <Box bg="var(--gamify-background)" borderRight="1px solid var(--gamify-border-color)" borderRadius='4px' width="802px">
            <VStack padding='32px' width="100%" align="stretch" gap='16px'>
                <GFLabel type="heading" fontWeight="500" label={__(`Email Notification`, 'gamify')} />

                <Divider width='100%' />
                <Flex flexDirection='column' gap={2}>
                    <Text fontWeight="600" fontSize="0.875rem" margin={0}>{__("Format", "gamify")}</Text>
                    <Select
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        placeholder="Choose one"
                        options={formatOptions}
                        value={formatOptions
                            .find(opt => opt?.value === email?.format)}
                        onChange={(opt) => dispatch(setEmailField({ field: 'format', value: opt ? opt.value : 'plain' }))}
                    />
                </Flex>
                <Flex flexDirection='column' gap={2}>
                    <Text fontWeight="600" fontSize="0.875rem" margin={0}>{__("Schedule", "gamify")}</Text>
                    <Select
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        placeholder="Choose one"
                        options={scheduleOptions}
                        value={scheduleOptions.find(opt => opt?.value === email?.schedule)}
                        onChange={(opt) => dispatch(setEmailField({ field: 'schedule', value: opt ? opt.value : 'immediate' }))}
                    />
                </Flex>
                <LabeledInput
                    label="From Name"
                    value={email.from_name || ''}
                    onChange={(e) => dispatch(setEmailField({ field: 'from_name', value: e.target.value }))}
                />
                <LabeledInput
                    label="From Address"
                    value={email.from_address || ''}
                    onChange={(e) => dispatch(setEmailField({ field: 'from_address', value: e.target.value }))}
                />
                <LabeledInput
                    label="Default Email Content"
                    type="textarea"
                    inputStyle={{ height: '80px' }}
                    value={email.default_content || ''}
                    onChange={(e) => dispatch(setEmailField({ field: 'default_content', value: e.target.value }))}
                />

                <Text fontSize="12px" color="gray.500" mt="-10px">
                    {__('Available placeholders: {user_name}, {level_name}, {site_name}', 'gamify')}
                </Text>

                <Flex justifyContent='flex-end'>
                    <Button {...primaryBtn} onClick={handleSave} isLoading={saveStatus === 'saving'}>
                        {__('Save Changes', 'gamify')}
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
};

export default EmailNotice;