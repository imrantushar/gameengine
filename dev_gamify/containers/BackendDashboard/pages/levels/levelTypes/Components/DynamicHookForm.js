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

const DynamicLevelField = ({ fieldKey, config, value, onChange, integrationSlug }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const isDisabled = config.is_pro && false;

    useEffect(() => {
        if (config.dynamic && !isDisabled) {
            setLoading(true);
            dispatch(fetchDynamicOptions({ integration: config.dynamic.integration || integrationSlug, query: config.dynamic.query }))
                .unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, dispatch, integrationSlug]);

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text fontSize="sm" fontWeight="500" m="0">{config.label} {config.required && <span style={{ color: "red" }}>*</span>}</Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
    );

    if (config.type === 'select' || config.type === 'dynamic_select') {
        const optionsSource = config.options ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([v, l]) => ({ value: v, label: l }))) : dynamicOptions;
        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select isDisabled={isDisabled} isLoading={loading} options={optionsSource} value={optionsSource.find(opt => String(opt.value) === String(value)) || null} onChange={(sel) => onChange(sel ? sel.value : '')} classNamePrefix="gamify-select" />
            </Box>
        );
    }
    return <LabeledInput label={config.label} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} disabled={isDisabled} />;
};

const DynamicHookForm = ({ hookId, hookInfo, settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
                <Flex direction="column" gap="16px">
                    {(hookInfo.schema || []).map(config => {
                        if (config.scope && !config.scope.includes('level')) return null;
                        return (
                            <DynamicLevelField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} onChange={(newValue) => onChange(config.key, newValue)} />
                        );
                    })}
                </Flex>
                <Flex borderTop="1px solid var(--gamify-border-color)" mt="24px" pt="16px" justifyContent='flex-end'>
                    <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>{__('Done', 'gamify')}</Button>
                </Flex>
            </CustomCollapsible>
        </>
    );
};

export default DynamicHookForm;