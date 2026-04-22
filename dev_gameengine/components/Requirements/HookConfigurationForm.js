import { Icon } from '@GFUtils/ui';
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
import GFLabel from '@GFComponents/Labels/GFLabel';
const DynamicField = ({
  fieldKey,
  config,
  value,
  onChange,
  integrationSlug,
  type,
  parameters
}) => {
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
      })).unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
    }
  }, [config.dynamic, isDisabled, integrationSlug]);
  let displayLabel = config.label;
  if (fieldKey === 'points') {
    displayLabel = type === 'award' ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine');
  } else if (fieldKey === 'log_label') {
    displayLabel = type === 'award' ? __('Award Log Description', 'gameengine') : __('Deduction Log Description', 'gameengine');
  }
  const labelElement = <div className="mb-2">
            <GFLabel label={`${displayLabel}${config.required ? ' *' : ''}`} isPro={config.is_pro} fontSize="sm" fontWeight="500" margin="0" />
        </div>;
  if (config.type === 'select' || config.type === 'dynamic_select') {
    const optionsSource = config.options ? Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, lbl]) => ({
      value: val,
      label: lbl
    })) : dynamicOptions;
    return <div style={{
      "width": config?.width === '100%' ? '100%' : `calc(${config?.width} - 8px)`,
      "opacity": isDisabled ? 0.7 : 1
    }}>
                {labelElement}

                <Select isMulti={config?.is_multi} isDisabled={isDisabled} isLoading={loading} placeholder={isDisabled ? __('Upgrade to Pro', 'gameengine') : __('Select...', 'gameengine')} className="gameengine-select gameengine-select--width-full" classNamePrefix="gameengine-select" options={optionsSource} value={config?.is_multi ? optionsSource.filter(opt => Array.isArray(parameters[fieldKey]) && parameters[fieldKey].includes(opt.value)) : optionsSource.find(opt => opt.value == parameters[fieldKey]) || null} onChange={val => {
        if (config?.is_multi) {
          onChange(val ? val.map(v => v.value) : []);
        } else {
          onChange(val ? val.value : '');
        }
      }} />
            </div>;
  }
  if (config.type === 'switch') {
    return <div className="flex items-center justify-between p-2 border border-dashed border-gray-200 rounded-md" style={{
      "width": config?.width === '100%' ? '100%' : `calc(${config?.width} - 8px)`,
      "opacity": isDisabled ? 0.6 : 1
    }}>
                <div>
                    <GFLabel label={displayLabel} isPro={config.is_pro} fontWeight="600" fontSize="sm" />
                    {config.description && <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>}
                </div>
                <button onClick={() => onChange(!value)}>
                    {value ? __('Enabled', 'gameengine') : __('Disabled', 'gameengine')}
                </button>
            </div>;
  }
  return <div style={{
    "width": config?.width === '100%' ? '100%' : `calc(${config?.width} - 8px)`,
    "opacity": isDisabled ? 0.7 : 1
  }}>
            <GameEngineInput label={displayLabel} isPro={config.is_pro}>
                <input style={commonInput} label={displayLabel} placeholder={isDisabled ? __('Locked Feature', 'gameengine') : config.placeholder || ''} type={config.type} value={parameters[fieldKey]} onChange={e => onChange(e.target.value)} required={config.required} disabled={isDisabled} />
            </GameEngineInput>
        </div>;
};
const DynamicHookForm = ({
  hookId,
  hookInfo,
  type,
  settings,
  handleChange,
  isOpen,
  setIsOpen,
  scope
}) => {
  const fieldsConfig = hookInfo.schema || [];
  const {
    values
  } = useFormikContext();
  return <CustomCollapsible label={(type === 'deduct' ? __('Deduct: ', 'gameengine') : '') + (hookInfo?.label || hookId)} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
            <div className="gameengine-active-hooks__inner flex flex-wrap w-full gap-4">
                {fieldsConfig.map(config => {
        if (config.scope && !config.scope.includes(scope)) {
          return;
        }
        const currentHook = values.requirements.find(item => item.trigger_key === hookId && item.action_type === type);
        return <DynamicField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} type={type} parameters={currentHook?.parameters} onChange={val => handleChange(config.key, val, hookInfo.id)} />;
      })}
            </div>
        </CustomCollapsible>;
};
const HookConfigurationForm = ({
  hookId,
  type,
  hookInfo,
  currentSettings,
  isOpen,
  setIsOpen,
  scope
}) => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const handleChange = (field, value, hook) => {
    const updatedFieldValue = values.requirements.map(item => {
      if (item.trigger_key === hook && item.action_type === type) {
        return {
          ...item,
          parameters: {
            ...item.parameters,
            [`${field}`]: value
          }
        };
      }
      return item;
    });
    setFieldValue('requirements', updatedFieldValue);
  };
  return <div className="gameengine-active-hooks bg-white rounded mb-2">
            <DynamicHookForm hookId={hookId} hookInfo={hookInfo} type={type} settings={currentSettings || {}} handleChange={handleChange} isOpen={isOpen} setIsOpen={setIsOpen} scope={scope} />
        </div>;
};
export default HookConfigurationForm;