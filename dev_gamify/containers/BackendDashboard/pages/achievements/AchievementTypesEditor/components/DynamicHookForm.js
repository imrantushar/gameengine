import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import CustomCollapsible from '@GFComponents/Collapsible';
import Divider from '@GFComponents/Divider';
import { __ } from '@wordpress/i18n';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchDynamicOptions } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { FaLock } from 'react-icons/fa6';
import LabeledInput from '@GFComponents/LabeledInput';
import Select from 'react-select';


const DynamicField = ({ fieldKey, config, value, onChange, integrationSlug, type }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const isProActive = false;
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
        displayLabel = type === 'award' ? __('Points to Award', 'gamify') : __('Points to Deduct', 'gamify');
    } else if (fieldKey === 'log_label') {
        displayLabel = type === 'award' ? __('Award Log Description', 'gamify') : __('Deduction Log Description', 'gamify');
    }

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text className='gamify-title' fontSize="sm" fontWeight="500" m="0">
                {displayLabel} {config.required && <span style={{ color: 'red' }}>*</span>}
            </Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
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
                    placeholder={isDisabled ? __('Upgrade to Pro', 'gamify') : __('Select...', 'gamify')}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
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
                    <Text fontSize="sm" fontWeight="600">{displayLabel}</Text>
                    {config.description && <Text fontSize="xs" color="gray.500">{config.description}</Text>}
                </Box>
                <Button size="xs" isDisabled={isDisabled} onClick={() => onChange(!value)} colorScheme={value ? "blue" : "gray"}>
                    {value ? __('Enabled', 'gamify') : __('Disabled', 'gamify')}
                </Button>
            </Flex>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <LabeledInput
                label={displayLabel}
                placeholder={isDisabled ? __('Locked Feature', 'gamify') : (config.placeholder || '')}
                type={config.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={config.required}
                disabled={isDisabled}
            />
        </Box>
    );
};

export const DynamicHookForm = ({ hookId, hookInfo, type, settings, handleChange, isOpen, setIsOpen }) => {
    const fieldsConfig = hookInfo.schema || [];

    return (
        <CustomCollapsible
            label={(type === 'deduct' ? __('Deduct: ', 'gamify') : '') + (hookInfo?.label || hookId)}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex direction="column" gap="16px" p={4}>
                {fieldsConfig.map((config) => {
                    if (config.scope && !config.scope.includes('point_type')) {
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

            <Divider width='100%' margin='12px 0' />

            <Flex padding="0 24px 12px 24px" justifyContent='flex-end'>
                <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>
                    {__('Done', 'gamify')}
                </Button>
            </Flex>
        </CustomCollapsible>
    );
};

export default DynamicHookForm;