import React from 'react';
import { Flex, Input, Switch } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Select from 'react-select';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import SettingsInner from '../Components/SettingsInner';
import SettingsInput from '../Components/SettingsInput';

const baseRoleOptions = [
    'administrator',
    'subscriber',
    'customer',
];

export const Economy = () => {
    const { values, setFieldValue } = useFormikContext();

    const roleOptions = baseRoleOptions.map(role => ({
        label: role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: role,
    }));

    const selectedRole = Array.isArray(values?.economy?.allowed_roles)
        ? values?.economy?.allowed_roles[0] || ''
        : values?.economy?.allowed_roles || '';

    const selectedRoleOption = roleOptions.filter(option => (values?.economy?.allowed_roles || []).includes(option.value));


    return (
        <SettingsInner heading={__('Economy', 'gameengine')}>
            <Flex direction="column" gap="16px">
                <SettingsInput label={__('Allowed Roles', 'gameengine')}>
                    <Select
                        className="gameengine-select gameengine-select--300"
                        classNamePrefix="gameengine-select"
                        options={roleOptions}
                        value={selectedRoleOption}
                        isMulti={true}
                        onChange={(options) => {
                            const cleanValues = (options || [])
                                .map(item => item?.value)
                                .filter(Boolean);

                            setFieldValue('economy.allowed_roles', cleanValues);
                        }}
                        menuPlacement="bottom"
                    />
                </SettingsInput>

                <SettingsInput label={__('Conversion Rate', 'gameengine')}>
                    <Input
                        type="number"
                        min="0"
                        step="1"
                        width="300px"
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

                <SettingsInput label={__('Enable Gateway', 'gameengine')}>
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
                        checked={Boolean(values?.economy?.enable_gateway)}
                        onCheckedChange={(changes) => {
                            setFieldValue('economy.enable_gateway', changes.checked);
                        }}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </SettingsInput>

                <SettingsInput label={__('Enable Partial Payment', 'gameengine')}>
                    <Switch.Root
                        colorPalette="blue"
                        size="sm"
                        mt="0.5"
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