import React, { useEffect } from 'react';
import { Button, Flex, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import LabeledInput from '@GFComponents/LabeledInput';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { fetchSettings, setEmailField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { useFormikContext } from 'formik';

const EmailNotice = () => {
    const {values, setFieldValue} = useFormikContext();
    const { email } = values;

    // Helper options
    const formatOptions = [
        { label: __('Plain Text', 'gameengine'), value: 'plain' },
        { label: __('HTML', 'gameengine'), value: 'html' }
    ];

    const scheduleOptions = [
        { label: __('Immediate', 'gameengine'), value: 'immediate' },
        { label: __('Daily Digest', 'gameengine'), value: 'daily' }
    ];

    return (
        <SettingsInner heading={__(`Email Notification`, "gameengine")}>
            <Flex direction="column" gap='16px'>
                <GameEngineInput label={__("Format", "gameengine")}>
                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        placeholder="Choose one"
                        options={formatOptions}
                        value={formatOptions.find(opt => opt?.value === email?.format)}
                        onChange={(opt) => setFieldValue('email.format', opt.value)}
                    />
                </GameEngineInput>

                <GameEngineInput label={__("Schedule", "gameengine")}>
                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        placeholder="Choose one"
                        options={scheduleOptions}
                        value={scheduleOptions.find(opt => opt?.value === email?.schedule)}
                        onChange={(opt) => setFieldValue('email.schedule', opt.value)}
                    />
                </GameEngineInput>

                <GameEngineInput label={__("From Name", "gameengine")}>
                    <Input
                        placeholder={__("Enter from name", "gameengine")}
                        value={email?.from_name || ''}
                        onChange={(e) => setFieldValue('email.from_name',e.target.value )}
                        {...commonInput}
                    />
                </GameEngineInput>

                <GameEngineInput label={__("From Address", "gameengine")}>
                    <Input
                        placeholder={__("Enter from address", "gameengine")}
                        value={email?.from_address || ''}
                        onChange={(e) => setFieldValue('email.from_address',e.target.value )}
                        {...commonInput}
                    />
                </GameEngineInput>

                <GameEngineInput label={__("Default Email Content", "gameengine")}>
                    <Textarea
                        placeholder={__("Enter email content", "gameengine")}
                        value={email?.default_content || ''}
                        onChange={(e) => setFieldValue('email.default_content', e.target.value)}
                    />
                </GameEngineInput>

                <Text fontSize="12px" color="gray.500" mt="-10px">
                    {__('Available placeholders: {user_name}, {level_name}, {site_name}', 'gameengine')}
                </Text>
            </Flex>
        </SettingsInner>
    );
};

export default EmailNotice;
