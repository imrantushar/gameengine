import React from 'react';
import { Flex, Input, Switch, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Select from 'react-select';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import SettingsInner from '../Components/SettingsInner';
import SettingsInput from '../Components/SettingsInput';
import { decodeHtmlEntity, is_pro } from '@GFUtils/helper';
import currencySymbols from '@GFUtils/currency-symbols';
import GFLabel from '@GFComponents/Labels/GFLabel';

export const Economy = () => {
    const { values, setFieldValue } = useFormikContext();

    const roleOptions = values?.available_roles || [];

    const selectedRoleOption = roleOptions.filter(option => (values?.economy?.allowed_roles || []).includes(option.value));

    const currencyOptions = Object.keys(currencySymbols).map(code => ({
        value: code,
        label: `${code} (${decodeHtmlEntity(currencySymbols[code])})`,
        symbol: decodeHtmlEntity(currencySymbols[code]),
    }));

    return (
        <SettingsInner heading={__('Ecommrce', 'gameengine')}>
            <Flex direction="column" gap="16px">

                <SettingsInput isPro={!is_pro} label={__('Conversion Rate', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Set how many points are equal to 1 unit of your store currency. For example, entering 100 means 100 points = $1.', 'gameengine')} />}
                >
                    <Input
                        type="number"
                        min="0"
                        step="1"
                        disabled={!is_pro}
                        width="300px"
                        placeholder={__("0", "gameengine")}
                        value={values?.economy?.conversion_rate ?? ''}
                        onChange={(event) => {
                            const rawValue = event.target.value;
                            setFieldValue(
                                'economy.conversion_rate',
                                rawValue === '' ? '' : Number(rawValue)
                            );
                        }}
                        {...commonInput}
                    />
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Enable Gateway', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Allow customers to pay for their entire order using their points balance as a payment method during checkout.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.economy?.enable_gateway)}
                        onCheckedChange={(changes) => {
                            setFieldValue('economy.enable_gateway', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput isPro={!is_pro} label={__('Enable Partial Payment', 'gameengine')}
                    subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Allow customers to apply a portion of their points for a discount on the cart or checkout page.', 'gameengine')} />}
                >
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        disabled={!is_pro}
                        checked={Boolean(values?.economy?.enable_partial_payment)}
                        onCheckedChange={(changes) => {
                            setFieldValue('economy.enable_partial_payment', changes.checked);
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

export default Economy;