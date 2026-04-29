import React from 'react';
import { Box, Flex, Switch, Text, Input, Icon } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import { FaLock } from 'react-icons/fa6';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Select from "react-select";
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { is_pro } from '@GFUtils/helper';

const cookieExpiryOptions = [
    { label: __('7 Days', 'gameengine'),  value: '7' },
    { label: __('14 Days', 'gameengine'), value: '14' },
    { label: __('30 Days', 'gameengine'), value: '30' },
    { label: __('60 Days', 'gameengine'), value: '60' },
    { label: __('90 Days', 'gameengine'), value: '90' },
];

const fraudDetectionTimeframeOptions = [
    { label: __('1 Hour', 'gameengine'),  value: '1' },
    { label: __('6 Hours', 'gameengine'), value: '6' },
    { label: __('12 Hours', 'gameengine'), value: '12' },
    { label: __('24 Hours (1 Day)', 'gameengine'), value: '24' },
    { label: __('72 Hours (3 Days)', 'gameengine'), value: '72' },
    { label: __('1 Week', 'gameengine'), value: '168' },
];

const ReferralSettings = () => {
    const { values, setFieldValue } = useFormikContext();

    const referral = values?.referral || {};
    const isDisabled = !is_pro;

    return (
        <Box width={'100%'} overflow="visible">

            {/* General */}
            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible">
                <Text
                    fontSize="20px"
                    fontWeight="500"
                    color="var(--gameengine-font-color)"
                    lineHeight="30px"
                    margin='0 0 16px 0'
                    padding='0 0 16px 0'
                    borderBottom="1px solid var(--gameengine-border-color)"
                >
                    {__("Referral System", "gameengine")}
                </Text>

                {!is_pro && (
                    <Flex align="center" gap="8px" mb="16px">
                        <Icon as={FaLock} boxSize="16px" color="orange.400" />
                        <Text fontSize="13px" color="var(--gameengine-primary)" margin="0">
                            {__("Referral settings are available in GameEngine Pro only.", "gameengine")}
                        </Text>
                    </Flex>
                )}

                <Flex direction="column" gap='16px'>

                    {/* Enable / Disable */}
                    <SettingsInput
                        label={__("Enable Referral System", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('Turn the entire referral & affiliate tracking system on or off.', 'gameengine')}
                            />
                        }
                    >
                        <Switch.Root
                            colorPalette="blue"
                            size="sm"
                            mt="0.5"
                            aria-label="Enable referral system"
                            checked={referral?.enabled === 'yes'}
                            disabled={isDisabled}
                            onCheckedChange={(changes) => {
                                setFieldValue('referral.enabled', changes.checked ? 'yes' : 'no');
                            }}
                        >
                            <Switch.HiddenInput />
                            <Switch.Control />
                        </Switch.Root>
                    </SettingsInput>

                    {/* Referral URL Slug */}
                    <SettingsInput
                        label={__("Referral URL Parameter", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('The query parameter used in referral links (e.g. "ref" → ?ref=username). Avoid spaces or special characters.', 'gameengine')}
                            />
                        }
                    >
                        <Input
                            maxWidth="300px"
                            size="sm"
                            borderRadius="6px"
                            value={referral?.referral_slug || 'ref'}
                            onChange={(e) => setFieldValue('referral.referral_slug', e.target.value.trim())}
                            placeholder="ref"
                            disabled={isDisabled}
                        />
                    </SettingsInput>

                    {/* Cookie Expiry */}
                    <SettingsInput
                        label={__("Cookie Expiry", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('How long the referral tracking cookie stays active in the visitor\'s browser after clicking a referral link.', 'gameengine')}
                            />
                        }
                    >
                        <Select
                            className="gameengine-select gameengine-select--300"
                            classNamePrefix="gameengine-select"
                            options={cookieExpiryOptions}
                            value={cookieExpiryOptions.find(opt => opt.value === String(referral?.cookie_expiry)) || cookieExpiryOptions[2]}
                            onChange={(option) => setFieldValue('referral.cookie_expiry', option.value)}
                            isDisabled={isDisabled}
                            menuPlacement="auto"
                        />
                    </SettingsInput>

                </Flex>
            </GameEngineBox>

            {/* Reward Settings */}
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
                    {__("Reward Settings", "gameengine")}
                </Text>

                <Flex direction="column" gap='16px'>

                    {/* Signup Points */}
                    <SettingsInput
                        label={__("Points Per Successful Signup", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('Default points awarded to the referrer when someone registers using their link. This is the fallback value — you can configure exact rewards in the Triggers section.', 'gameengine')}
                            />
                        }
                    >
                        <Input
                            maxWidth="150px"
                            size="sm"
                            borderRadius="6px"
                            type="number"
                            min={0}
                            value={referral?.signup_reward || '50'}
                            onChange={(e) => setFieldValue('referral.signup_reward', e.target.value)}
                            placeholder="50"
                            disabled={isDisabled}
                        />
                    </SettingsInput>

                </Flex>
            </GameEngineBox>

            {/* Fraud Detection Settings */}
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
                    {__("🛡️ Fraud Detection", "gameengine")}
                </Text>

                <Flex direction="column" gap='16px'>

                    {/* Enable Fraud Detection */}
                    <SettingsInput
                        label={__("Enable Fraud Detection", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('Monitor and flag suspicious referral patterns like multiple account signups from the same IP address.', 'gameengine')}
                            />
                        }
                    >
                        <Switch.Root
                            colorPalette="blue"
                            size="sm"
                            mt="0.5"
                            aria-label="Enable fraud detection"
                            checked={referral?.fraud_detection_enabled === 'yes'}
                            disabled={isDisabled}
                            onCheckedChange={(changes) => {
                                setFieldValue('referral.fraud_detection_enabled', changes.checked ? 'yes' : 'no');
                            }}
                        >
                            <Switch.HiddenInput />
                            <Switch.Control />
                        </Switch.Root>
                    </SettingsInput>

                    {/* Max Accounts Per IP */}
                    <SettingsInput
                        label={__("Max Accounts Per IP Address", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('Maximum number of new accounts allowed from the same IP address within the specified timeframe. Exceeding this triggers a fraud alert.', 'gameengine')}
                            />
                        }
                    >
                        <Input
                            maxWidth="150px"
                            size="sm"
                            borderRadius="6px"
                            type="number"
                            min={1}
                            value={referral?.fraud_detection_max_accounts || '3'}
                            onChange={(e) => setFieldValue('referral.fraud_detection_max_accounts', e.target.value)}
                            placeholder="3"
                            disabled={isDisabled}
                        />
                    </SettingsInput>

                    {/* Fraud Detection Timeframe */}
                    <SettingsInput
                        label={__("Fraud Detection Timeframe", "gameengine")}
                        subtitle={
                            <GFLabel
                                fontSize="0.75rem"
                                color="var(--gameengine-warn-muted)"
                                type="subtitle"
                                margin={0}
                                label={__('Time window to check for multiple signups from the same IP (e.g., if set to 24 hours, any IP creating 4+ accounts in a day will be flagged).', 'gameengine')}
                            />
                        }
                    >
                        <Select
                            className="gameengine-select gameengine-select--300"
                            classNamePrefix="gameengine-select"
                            options={fraudDetectionTimeframeOptions}
                            value={fraudDetectionTimeframeOptions.find(opt => opt.value === String(referral?.fraud_detection_timeframe)) || fraudDetectionTimeframeOptions[3]}
                            onChange={(option) => setFieldValue('referral.fraud_detection_timeframe', option.value)}
                            isDisabled={isDisabled}
                            menuPlacement="auto"
                        />
                    </SettingsInput>

                </Flex>
            </GameEngineBox>

        </Box>
    );
};

export default ReferralSettings;
