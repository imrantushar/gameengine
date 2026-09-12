import CustomCollapsible from '@GFComponents/Collapsible';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchDynamicOptions } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import Select from 'react-select';
import GFLabel from '@GFComponents/Labels/GFLabel';

const DynamicField = ({
  fieldKey,
  config,
  value,
  onChange,
  integrationSlug,
  type
}) => {
  const dispatch = useDispatch();
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (config.dynamic) {
      setLoading(true);
      dispatch(fetchDynamicOptions({
        integration: config.dynamic.integration || integrationSlug,
        query: config.dynamic.query
      })).unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
    }
  }, [config.dynamic, integrationSlug]);
  let displayLabel = config.label;
  if (fieldKey === 'points') {
    displayLabel = type === 'award' ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine');
  } else if (fieldKey === 'log_label') {
    displayLabel = type === 'award' ? __('Award Log Description', 'gameengine') : __('Deduction Log Description', 'gameengine');
  }
  const labelElement = <div style={{
    "marginBottom": "2"
  }}>
            <GFLabel label={`${displayLabel}${config.required ? ' *' : ''}`} fontSize="sm" fontWeight="500" margin="0" />
        </div>;
  if (config.type === 'select' || config.type === 'dynamic_select') {
    const optionsSource = config.options ? Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, lbl]) => ({
      value: val,
      label: lbl
    })) : dynamicOptions;
    return <div className="w-full">
                {labelElement}
                <Select isLoading={loading} placeholder={__('Select...', 'gameengine')} className="gameengine-select" classNamePrefix="gameengine-select" options={optionsSource} value={optionsSource.find(opt => opt.value == value) || null} onChange={val => onChange(val ? val.value : '')} />
            </div>;
  }
  if (config.type === 'switch') {
    return <div className="flex items-center justify-between w-full p-2" style={{
      "border": "1px dashed",
      "borderColor": "gray.200",
      "borderRadius": "md"
    }}>
                <div>
                    <GFLabel label={displayLabel} fontWeight="600" fontSize="sm" />
                    {config.description && <p style={{
          "fontSize": "xs",
          "color": "gray.500",
          "marginTop": "2px"
        }}>{config.description}</p>}
                </div>
                <button onClick={() => onChange(!value)}>
                    {value ? __('Enabled', 'gameengine') : __('Disabled', 'gameengine')}
                </button>
            </div>;
  }
  return <div className="w-full">
            <LabeledInput label={displayLabel} placeholder={config.placeholder || ''} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(e.target.value)} required={config.required} />
        </div>;
};

export const DynamicHookForm = ({
  hookId,
  hookInfo,
  type,
  settings,
  handleChange,
  isOpen,
  setIsOpen,
  context = 'point_type'
}) => {
  const fieldsConfig = hookInfo.schema || [];
  return <CustomCollapsible label={(type === 'deduct' ? __('Deduct: ', 'gameengine') : '') + (hookInfo?.label || hookId)} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
            <div className="flex flex-col gap-4">
                {fieldsConfig.map(config => {
        if (config.scope && !config.scope.includes(context)) {
          return null;
        }
        return <DynamicField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} type={type} onChange={val => handleChange(config.key, val)} />;
      })}
            </div>
        </CustomCollapsible>;
};

export default DynamicHookForm;
