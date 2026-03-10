import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsInput from '../Components/SettingsInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { Flex, Switch } from '@chakra-ui/react';
import SettingsInner from '../Components/SettingsInner';
import { useFormikContext } from 'formik';
import { is_pro } from '@GFUtils/helper';

export default function Dashboard() {
    const { setFieldValue, values } = useFormikContext();

    return (
        <SettingsInner fullWidth={true} heading={__('Dashboard', 'gameengine')}>
            <Flex direction="column" gap="16px">

                <SettingsInput isPro={!is_pro} label={__('Enable On WooCommerce', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Integrates GameEngine menus and stats into the WooCommerce "My Account" page.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.dashboard?.enable_on_wc)}
                        onCheckedChange={(changes) => {
                            setFieldValue('dashboard.enable_on_wc', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Enable On Academy LMS', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Integrates GameEngine menus and stats into the Academy LMS student dashboard.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.dashboard?.enable_on_lms)}
                        onCheckedChange={(changes) => {
                            setFieldValue('dashboard.enable_on_lms', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Show Stats Widget', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Show a quick summary of Points and Rank at the top of user dashboards.', 'gameengine')} />}
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

                <SettingsInput isPro={!is_pro} label={__('Enable Menus', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Add "Withdraw Points" and "Rewards Store" links directly to the dashboard sidebar.', 'gameengine')} />}
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
                
                <SettingsInput isPro={!is_pro} label={__('Enable Coupon Generate', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Activate the rewards store where users can exchange points for unique WooCommerce discount coupons via shortcode.', 'gameengine')} />}
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
