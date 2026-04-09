import React, { useState } from 'react';
import { Box, Flex, Input, Button, Switch, Text } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { useFormikContext } from 'formik';
import { commonInput, outlineBtn, transparentMiniBtn } from '../../../../../../assets/scss/chakra/recipe';
import GameEngineEditor from '@GFComponents/editor';

const EmailTemplates = () => {
    const { values, setFieldValue, handleChange } = useFormikContext();
    const [editingKey, setEditingKey] = useState(null);

    const emailConfigs = {
        level: {
            title: __("Level Up Email", "gameengine"),
            desc: __("Sent when a user reaches a new level.", "gameengine"),
            tags: ['{user_name}', '{level_name}', '{site_name}'],
            subjectField: 'email_templates.level_subject',
            bodyField: 'email_templates.level_body',
            enabledField: 'email_templates.level_enabled',
            userEnabledField: 'email_templates.level_user_enabled',
            adminEnabledField: 'email_templates.level_admin_enabled',
            defaultSubject: 'Congratulations! You reached {level_name}',
            defaultBody: 'Hi {user_name},<br><br>You reached {level_name}!'
        },
        achievement: {
            title: __("Achievement Unlocked Email", "gameengine"),
            desc: __("Sent when a user unlocks a new achievement.", "gameengine"),
            tags: ['{user_name}', '{achievement_name}', '{site_name}'],
            subjectField: 'email_templates.achievement_subject',
            bodyField: 'email_templates.achievement_body',
            enabledField: 'email_templates.achievement_enabled',
            userEnabledField: 'email_templates.achievement_user_enabled',
            adminEnabledField: 'email_templates.achievement_admin_enabled',
            defaultSubject: 'New Achievement Unlocked: {achievement_name}',
            defaultBody: 'Hi {user_name},<br><br>You unlocked {achievement_name}!'
        },
        inactivity: {
            title: __("Inactivity Nudge Email", "gameengine"),
            desc: __("Sent when a user has been inactive.", "gameengine"),
            tags: ['{user_name}', '{points_balance}', '{site_name}'],
            subjectField: 'email_templates.inactivity_subject',
            bodyField: 'email_templates.inactivity_body',
            enabledField: 'email_templates.inactivity_enabled',
            userEnabledField: 'email_templates.inactivity_user_enabled',
            adminEnabledField: 'email_templates.inactivity_admin_enabled',
            defaultSubject: 'We miss you! You have {points_balance} points waiting.',
            defaultBody: 'Hi {user_name},<br><br>Come back to use your {points_balance} points.'
        },
        milestone: {
            title: __("Points Milestone Alert", "gameengine"),
            desc: __("Sent every multiple of 500 points.", "gameengine"),
            tags: ['{user_name}', '{points_balance}', '{next_level}', '{points_to_next}'],
            subjectField: 'email_templates.milestone_subject',
            bodyField: 'email_templates.milestone_body',
            enabledField: 'email_templates.milestone_enabled',
            userEnabledField: 'email_templates.milestone_user_enabled',
            adminEnabledField: 'email_templates.milestone_admin_enabled',
            defaultSubject: 'You reached a milestone! {points_balance} Points!',
            defaultBody: 'Hi {user_name},<br><br>You only need {points_to_next} points to reach {next_level}.'
        }
    };

    const handleCopyTag = (tag) => {
        navigator.clipboard.writeText(tag);
    };

    const CustomSwitch = ({ isChecked, onChange }) => (
        <Switch.Root
            colorPalette="blue"
            size="sm"
            checked={isChecked}
            onCheckedChange={(details) => onChange(details.checked)}
        >
            <Switch.HiddenInput />
            <Switch.Control />
        </Switch.Root>
    );

    if (editingKey) {
        const config = emailConfigs[editingKey];
        const isEnabled = values?.email_templates?.[editingKey + '_enabled'] ?? true;
        
        return (
            <Box width='100%' overflow="visible">
                <Flex mb="20px" alignItems="center" justify="space-between">
                    <Flex alignItems="center">
                        <Button {...outlineBtn} size="sm" onClick={() => setEditingKey(null)} mr="15px">
                            &larr; {__("Back", "gameengine")}
                        </Button>
                        <GFLabel type="heading" margin='0' label={config.title} />
                    </Flex>
                <Flex alignItems="center" gap="10px">
                        <Text fontSize="14px" fontWeight="500">{__("Notify User", "gameengine")}</Text>
                        <CustomSwitch 
                            isChecked={values?.email_templates?.[editingKey + '_user_enabled'] ?? true}
                            onChange={(val) => setFieldValue(config.userEnabledField, val)}
                        />
                    </Flex>
                    <Flex alignItems="center" gap="10px" ml="20px">
                        <Text fontSize="14px" fontWeight="500">{__("Notify Admin", "gameengine")}</Text>
                        <CustomSwitch 
                            isChecked={values?.email_templates?.[editingKey + '_admin_enabled'] ?? false}
                            onChange={(val) => setFieldValue(config.adminEnabledField, val)}
                        />
                    </Flex>
                </Flex>

                <Flex gap="30px" align="start">
                    {/* Left Column: Editor */}
                    <Box flex="1" minW="0">
                        <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible">
                            <SettingsInput label={__("Subject", "gameengine")}>
                                <Flex flexWrap="wrap" gap="8px" mb="12px">
                                    {config.tags.map(tag => (
                                        <Button
                                            key={tag}
                                            {...transparentMiniBtn}
                                            bg="#f3f4f6"
                                            border="none"
                                            onClick={() => handleCopyTag(tag)}
                                            title={__("Click to copy", "gameengine")}
                                        >
                                            {tag}
                                        </Button>
                                    ))}
                                </Flex>
                                <Input
                                    name={config.subjectField}
                                    value={values?.email_templates?.[editingKey + '_subject'] || ''}
                                    onChange={handleChange}
                                    placeholder={config.defaultSubject}
                                    {...commonInput}
                                />
                            </SettingsInput>

                            {editingKey === 'inactivity' && (
                                <SettingsInput mt="20px" label={__("Inactivity Days", "gameengine")}>
                                    <Input
                                        type="number"
                                        name="email_templates.inactivity_days"
                                        value={values?.email_templates?.inactivity_days || '7'}
                                        onChange={handleChange}
                                        {...commonInput}
                                        width={"100px"}
                                    />
                                </SettingsInput>
                            )}

                            <SettingsInput label={__("Additional Content", "gameengine")} mt="24px">
                                <Box 
                                    border="1px solid var(--gameengine-border-color)" 
                                    borderRadius="4px" 
                                    sx={{
                                        '.ql-editor': {
                                            minHeight: '200px'
                                        }
                                    }}
                                >
                                    <GameEngineEditor 
                                        name={config.bodyField}
                                        defaultValue={values?.email_templates?.[editingKey + '_body'] || config.defaultBody}
                                        saveValueHandler={(name, content) => setFieldValue(name, content)}
                                        suffix={`email-template-${editingKey}`}
                                    />
                                </Box>
                            </SettingsInput>
                        </GameEngineBox>
                    </Box>

                    {/* Right Column: Live Preview */}
                    <Box flex="1" minW="0" position="sticky" top="130px">
                        <Box bg="#f8f9fa" p="30px" borderRadius="8px" border="1px solid var(--gameengine-border-color)">
                            <Text fontSize="16px" fontWeight="600" mb="20px" color="#738496" display="flex" justifyContent="space-between">
                                {__("Template Preview", "gameengine")}
                            </Text>
                            <Box bg="#fff" borderRadius="8px" p="30px" boxShadow="0 4px 12px rgba(0,0,0,0.06)">
                                <Text fontSize="20px" fontWeight="600" mb="16px" color="#111" borderBottom="1px solid #f0f0f0" pb="15px">
                                    {values?.email_templates?.[editingKey + '_subject'] || config.defaultSubject}
                                </Text>
                                <Box 
                                    className="ql-editor" 
                                    p="0" 
                                    color="#555" 
                                    lineHeight="1.6"
                                    dangerouslySetInnerHTML={{
                                        __html: values?.email_templates?.[editingKey + '_body'] || config.defaultBody
                                    }} 
                                />
                                <Box mt="30px" pt="20px" borderTop="1px solid #f0f0f0">
                                    <Text fontSize="14px" fontWeight="600" color="#333">Thank You</Text>
                                    <Text fontSize="13px" color="#888">{values?.email_templates?.sender_name || 'GameEngine'}</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Box>
        );
    }

    return (
        <Box width='100%' overflow="visible">
            {/* General Settings */}
            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible" mb="30px">
                <Text
                    fontSize="20px"
                    fontWeight="500"
                    color="var(--gameengine-font-color)"
                    lineHeight="30px"
                    margin='0 0 24px 0' 
                    padding='0 0 16px 0'
                    borderBottom="1px solid var(--gameengine-border-color)"
                >
                    {__("General", "gameengine")}
                </Text>
                
                <Flex direction="column" gap='16px'>
                    <SettingsInput label={__("Name", "gameengine")} subtitle={<Text fontSize="12px" color="#738496" m={0}>{__("The common name for all outgoing emails.", "gameengine")}</Text>}>
                        <Input
                            name="email_templates.sender_name"
                            value={values?.email_templates?.sender_name || 'GameEngine LMS'}
                            onChange={handleChange}
                            {...commonInput}
                        />
                    </SettingsInput>
                    <SettingsInput label={__("E-Mail Address", "gameengine")} subtitle={<Text fontSize="12px" color="#738496" m={0}>{__("All emails will be sent from this email address.", "gameengine")}</Text>}>
                        <Input
                            name="email_templates.sender_email"
                            value={values?.email_templates?.sender_email || 'admin@yoursite.com'}
                            onChange={handleChange}
                            {...commonInput}
                        />
                    </SettingsInput>
                </Flex>
            </GameEngineBox>

            {/* Templates List */}
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
                    {__("Email Template", "gameengine")}
                </Text>
                
                <Flex direction="column" gap="16px">
                    {Object.entries(emailConfigs).map(([key, config]) => {
                        const isEnabled = values?.email_templates?.[key + '_enabled'] ?? true;
                        return (
                            <Flex 
                                key={key} 
                                align="center" 
                                justify="space-between" 
                                p="16px 20px" 
                                border="1px solid var(--gameengine-border-color)" 
                                borderRadius="6px"
                                bg="#fff"
                            >
                                <Box>
                                    <Text fontSize="16px" fontWeight="600" color="var(--gameengine-font-color)" m="0px">
                                        {config.title}
                                    </Text>
                                    <Text fontSize="14px" color="#738496" m={0}>
                                        {config.desc}
                                    </Text>
                                </Box>
                                
                                <Flex align="center" gap="20px">
                                    <Button 
                                        {...outlineBtn} 
                                        size="sm" 
                                        onClick={() => setEditingKey(key)}
                                        display="flex"
                                        gap="6px"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        {__("Edit Template", "gameengine")}
                                    </Button>

                                    <Flex gap="15px" align="center">
                                        <Flex align="center" gap="8px">
                                            <Text fontSize="13px" color="#555">{__("User:", "gameengine")}</Text>
                                            <CustomSwitch 
                                                isChecked={values?.email_templates?.[key + '_user_enabled'] ?? true}
                                                onChange={(val) => setFieldValue(config.userEnabledField, val)}
                                            />
                                        </Flex>
                                        <Flex align="center" gap="8px">
                                            <Text fontSize="13px" color="#555">{__("Admin:", "gameengine")}</Text>
                                            <CustomSwitch 
                                                isChecked={values?.email_templates?.[key + '_admin_enabled'] ?? false}
                                                onChange={(val) => setFieldValue(config.adminEnabledField, val)}
                                            />
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                        );
                    })}
                </Flex>
            </GameEngineBox>
        </Box>
    );
};

export default EmailTemplates;
