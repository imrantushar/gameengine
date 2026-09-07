import CustomCollapsible from '@GFComponents/Collapsible';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchDynamicOptions } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import LabeledInput from '@GFComponents/LabeledInput';
import GFLabel from '@GFComponents/Labels/GFLabel';

const DynamicLevelField = ({
  fieldKey,
  config,
  value,
  onChange,
  integrationSlug
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
  }, [config.dynamic, dispatch, integrationSlug]);
  const labelElement = <div style={{
    "marginBottom": "2"
  }}>
            <GFLabel label={`${config.label}${config.required ? ' *' : ''}`} fontSize="sm" fontWeight="500" margin="0" />
        </div>;
  if (config.type === 'select' || config.type === 'dynamic_select') {
    const optionsSource = config.options ? Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([v, l]) => ({
      value: v,
      label: l
    })) : dynamicOptions;
    return <div className="w-full">
                {labelElement}
                <Select className="gameengine-select" classNamePrefix="gameengine-select" isLoading={loading} options={optionsSource} value={optionsSource.find(opt => String(opt.value) === String(value)) || null} onChange={sel => onChange(sel ? sel.value : '')} />
            </div>;
  }
  return <LabeledInput label={config.label} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(e.target.value)} />;
};
const DynamicHookForm = ({
  hookId,
  hookInfo,
  settings,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return <>
            <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
                <div className="flex flex-col gap-4">
                    {(hookInfo.schema || []).map(config => {
          if (config.scope && !config.scope.includes('level')) return null;
          return <DynamicLevelField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} onChange={newValue => onChange(config.key, newValue)} />;
        })}
                </div>
            </CustomCollapsible>
        </>;
};
export default DynamicHookForm;