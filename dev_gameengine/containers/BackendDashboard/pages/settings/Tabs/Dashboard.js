import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsInput from '../Components/SettingsInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { Flex, Switch } from '@chakra-ui/react';
import SettingsInner from '../Components/SettingsInner';
import { useFormikContext } from 'formik';
import { is_pro } from '@GFUtils/helper';
import Select from 'react-select';
import { useSelector } from 'react-redux';

export default function Dashboard() {
    const { setFieldValue, values } = useFormikContext();
    const addons = useSelector(state => state.addons)

    const platformIntegrationOptions = [
        { value: 'woocommerce', label: __('WooCommerce', 'gameengine'), isDisabled: !addons?.woocommerce },
        { value: 'academylms', label: __('Academy LMS', 'gameengine'), isDisabled: !addons?.academylms },
    ];

    return (
        <SettingsInner fullWidth={true} heading={__('Frontend Dashboard', 'gameengine')}>
            <Flex direction="column" gap="16px">

                <SettingsInput isPro={!is_pro} label={__('Dashboard Integration', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Select where you want to display game stats and navigation.', 'gameengine')} />}
                >
                    <Select
                        name='platform_integration'
                        placeholder={__('Select Platform', 'gameengine')}
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        options={platformIntegrationOptions}
                        value={platformIntegrationOptions.filter(item => (values?.dashboard?.platform_integration ?? []).includes(item.value))}
                        onChange={options => {
                            const cleanValues = (options || [])
                                .map(item => item?.value)
                                .filter(Boolean);
                            setFieldValue('dashboard.platform_integration', cleanValues)
                        }}
                        menuPlacement="auto"
                        isMulti
                        isSearchable
                    />
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Show User Stats', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Display a quick view of current Points and Rank to users.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.dashboard?.show_stats_widget)}
                        onCheckedChange={(changes) => {
                            setFieldValue('dashboard.show_stats_widget', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Show Navigation Links', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Add "Withdraw Points" and "Rewards Store" to the sidebar.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.dashboard?.menu_payout)}
                        onCheckedChange={(changes) => {
                            setFieldValue('dashboard.menu_payout', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Enable Coupon Exchange', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Let users trade their points for WooCommerce discount coupons.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.dashboard?.menu_marketplace)}
                        onCheckedChange={(changes) => {
                            setFieldValue('dashboard.menu_marketplace', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>
            </Flex>
        </SettingsInner>
    );
};
