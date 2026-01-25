import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import CustomCollapsible from '@GFComponents/Collapsible';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { fetchDynamicOptions } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { FaLock } from 'react-icons/fa6';
import Select from 'react-select';
import { commonInput } from '../../../assets/scss/chakra/recipe';
import { is_pro } from '@GFUtils/helper';
import GameEngineInput from '@GFComponents/GameEngineInput';

const DynamicField = ({ fieldKey, config, value, onChange, integrationSlug, type, parameters }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const isDisabled = !is_pro && config?.is_pro;

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
        <Flex align="center" gap={2} mb="8px">
            <Text className='gameengine-title' fontSize="sm" fontWeight="500" m="0">
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
                    isMulti={config?.is_multi}
                    isDisabled={isDisabled}
                    isLoading={loading}
                    placeholder={
                        isDisabled
                            ? __('Upgrade to Pro', 'gameengine')
                            : __('Select...', 'gameengine')
                    }
                    className="gameengine-select"
                    classNamePrefix="gameengine-select"
                    options={optionsSource}
                    value={
                        config?.is_multi
                            ? optionsSource.filter(opt =>
                                Array.isArray(parameters[fieldKey]) && parameters[fieldKey].includes(opt.value)
                            )
                            : optionsSource.find(opt => opt.value == parameters[fieldKey]) || null
                    }
                    onChange={(val) => {
                        if (config?.is_multi) {
                            onChange(val ? val.map(v => v.value) : []);
                        } else {
                            onChange(val ? val.value : '');
                        }
                    }}
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
                    {value ? __('Enabled', 'gameengine') : __('Disabled', 'gameengine')}
                </Button>
            </Flex>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <GameEngineInput label={displayLabel}>
                <Input
                    {...commonInput}
                    label={displayLabel}
                    placeholder={isDisabled ? __('Locked Feature', 'gameengine') : (config.placeholder || '')}
                    type={config.type}
                    value={parameters[fieldKey]}
                    onChange={(e) => onChange(e.target.value)}
                    required={config.required}
                    disabled={isDisabled}
                />
            </GameEngineInput>
        </Box>
    );
};

const DynamicHookForm = ({ hookId, hookInfo, type, settings, handleChange, isOpen, setIsOpen, scope }) => {
    const fieldsConfig = hookInfo.schema || [];
    const { values } = useFormikContext();

    return (
        <CustomCollapsible
            label={(type === 'deduct' ? __('Deduct: ', 'gameengine') : '') + (hookInfo?.label || hookId)}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex direction="column" gap="16px" className='gameengine-active-hooks__inner'>
                {fieldsConfig.map((config) => {
                    if (config.scope && !config.scope.includes(scope)) {
                        return;
                    }
                    const currentHook = values.requirements.find(item => item.trigger_key === hookId );

                    return (
                        <DynamicField
                            key={config.key}
                            fieldKey={config.key}
                            config={config}
                            value={settings[config.key] ?? config.default ?? ''}
                            integrationSlug={hookInfo.integrationSlug}
                            type={type}
                            parameters={currentHook?.parameters}
                            onChange={(val) => handleChange(config.key, val, hookInfo.hook)}
                        />
                    );
                })}
            </Flex>
        </CustomCollapsible>
    );
};

const HookConfigurationForm = ({ hookId, type, hookInfo, currentSettings, isOpen, setIsOpen, scope}) => {
    const { values, setFieldValue } = useFormikContext();
    
    const handleChange = (field, value, hook) => {
        const updatedFieldValue = values.requirements.map(item => {
            if(item.trigger_key === hook) {
                return { 
                    ...item,
                    parameters: {
                        ...item.parameters,
                        [`${field}`]: value
                    }
                }
            }
            return item;
        })
        setFieldValue('requirements', updatedFieldValue);
    };

    return (
        <Box background="white" borderRadius="4px" mb={2} className='gameengine-active-hooks'>
            <DynamicHookForm
                hookId={hookId}
                hookInfo={hookInfo}
                type={type}
                settings={currentSettings || {}}
                handleChange={handleChange}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                scope={scope}
            />
        </Box>
    );
};

export default HookConfigurationForm;
