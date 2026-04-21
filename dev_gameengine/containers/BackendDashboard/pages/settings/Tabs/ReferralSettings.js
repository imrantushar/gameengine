import React from 'react';
import { Box, Flex, Switch, Text, Input } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import Select from "react-select";
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const cookieExpiryOptions = [
    { label: __('7 Days', 'gameengine'),  value: '7' },
    { label: __('14 Days', 'gameengine'), value: '14' },
    { label: __('30 Days', 'gameengine'), value: '30' },
    { label: __('60 Days', 'gameengine'), value: '60' },
    { label: __('90 Days', 'gameengine'), value: '90' },
];

const ReferralSettings = () => {
    const { values, setFieldValue } = useFormikContext();

    const referral = values?.referral || {};

    return (
        <Box width={'100%'} overflow="visible">

            {/* General */}
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
                    {__("Referral System", "gameengine")}
                </Text>

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
                        />
                    </SettingsInput>

                </Flex>
            </GameEngineBox>

        </Box>
    );
};

export default ReferralSettings;
