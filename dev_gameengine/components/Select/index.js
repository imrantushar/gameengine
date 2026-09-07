import ReactSelect from 'react-select';
const GFSelect = ({
  label,
  placeholder = "Select option",
  items = [],
  value,
  onChange,
  size = "sm",
  width = "100%",
  style,
  isMulti = false,
  isDisabled = false
}) => {
  const options = items.map(item => ({
    value: item.value,
    label: item.label
  }));
  const currentValue = isMulti ? options.filter(o => Array.isArray(value) && value.includes(o.value)) : options.find(o => o.value === (Array.isArray(value) ? value[0] : value)) || null;
  return <div style={{
    width,
    marginTop: '2px',
    ...style
  }}>
      {label && <label className="block text-sm font-medium mb-1">
          {label}
        </label>}
      <ReactSelect isMulti={isMulti} isDisabled={isDisabled} placeholder={placeholder} options={options} value={currentValue} onChange={selected => {
      if (isMulti) {
        onChange?.({
          value: selected ? selected.map(s => s.value) : []
        });
      } else {
        onChange?.({
          value: selected ? [selected.value] : []
        });
      }
    }} className="gameengine-select" classNamePrefix="gameengine-select" />
    </div>;
};
export default GFSelect;