import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import CustomCollapsible from '@GFComponents/Collapsible';
import Divider from '@GFComponents/Divider';
import { __ } from '@wordpress/i18n';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchDynamicOptions } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { FaLock } from 'react-icons/fa6';
import Select from 'react-select';
import { is_pro as isProActive } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';


const DynamicField = ({ fieldKey, config, value, onChange, integrationSlug, type }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const isDisabled = config.is_pro && !isProActive;

    useEffect(() => {
        if (config.dynamic && !isDisabled) {
            setLoading(true);
            dispatch(fetchDynamicOptions({
                integration: config.dynamic.integration || integrationSlug,
                query: config.dynamic.query
            })).unwrap()
                .then(res => setDynamicOptions(res))
                .finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, integrationSlug]);

    let displayLabel = config.label;
    if (fieldKey === 'points') {
        displayLabel = type === 'award' ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine');
    } else if (fieldKey === 'log_label') {
        displayLabel = type === 'award' ? __('Award Log Description', 'gameengine') : __('Deduction Log Description', 'gameengine');
    }

    const labelElement = (
        <Box mb="2">
            <GFLabel 
                label={`${displayLabel}${config.required ? ' *' : ''}`}
                isPro={config.is_pro}
                fontSize="sm"
                fontWeight="500"
                margin="0"
            />
        </Box>
    );

    if (config.type === 'select' || config.type === 'dynamic_select') {
        const optionsSource = config.options
            ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, lbl]) => ({ value: val, label: lbl })))
            : dynamicOptions;

        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select
                    isDisabled={isDisabled}
                    isLoading={loading}
                    placeholder={isDisabled ? __('Upgrade to Pro', 'gameengine') : __('Select...', 'gameengine')}
                    className="gameengine-select"
                    classNamePrefix="gameengine-select"
                    options={optionsSource}
                    value={optionsSource.find(opt => opt.value == value) || null}
                    onChange={(val) => onChange(val ? val.value : '')}
                />
            </Box>
        );
    }

    if (config.type === 'switch') {
        return (
            <Flex align="center" justify="space-between" width="100%" p={2} border="1px dashed" borderColor="gray.200" borderRadius="md" opacity={isDisabled ? 0.6 : 1}>
                <Box>
                    <GFLabel label={displayLabel} isPro={config.is_pro} fontWeight="600" fontSize="sm" />
                    {config.description && <Text fontSize="xs" color="gray.500" mt="2px">{config.description}</Text>}
                </Box>
                <Button size="xs" isDisabled={isDisabled} onClick={() => onChange(!value)} colorScheme={value ? "blue" : "gray"}>
                    {value ? __('Enabled', 'gameengine') : __('Disabled', 'gameengine')}
                </Button>
            </Flex>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <LabeledInput
                label={displayLabel}
                isPro={config.is_pro}
                placeholder={isDisabled ? __('Locked Feature', 'gameengine') : (config.placeholder || '')}
                type={config.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={config.required}
                disabled={isDisabled}
            />
        </Box>
    );
};

export const DynamicHookForm = ({ hookId, hookInfo, type, settings, handleChange, isOpen, setIsOpen, context = 'point_type' }) => {
    const fieldsConfig = hookInfo.schema || [];

    return (
        <CustomCollapsible
            label={(type === 'deduct' ? __('Deduct: ', 'gameengine') : '') + (hookInfo?.label || hookId)}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex direction="column" gap="16px">
                {fieldsConfig.map((config) => {
                    if (config.scope && !config.scope.includes(context)) {
                        return null;
                    }

                    return (
                        <DynamicField
                            key={config.key}
                            fieldKey={config.key}
                            config={config}
                            value={settings[config.key] ?? config.default ?? ''}
                            integrationSlug={hookInfo.integrationSlug}
                            type={type}
                            onChange={(val) => handleChange(config.key, val)}
                        />
                    );
                })}
            </Flex>
        </CustomCollapsible>
    );
};

export default DynamicHookForm;