import { Icon } from '@GFComponents/UI';
import Select from 'react-select';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import SettingsInput from '../../Components/SettingsInput';
import { clearBtn, commonInput } from '../../../../../../../assets/scss/chakra/recipe';
import { MdDelete } from 'react-icons/md';
const typesArray = [{
  label: __('Percent', 'gameengine'),
  value: 'percent'
}, {
  label: __('Fixed Cart', 'gameengine'),
  value: 'fixed_cart'
}];
const MarketplaceFields = () => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  return <div className="w-full">
      <FieldArray name="marketplace.offers">
        {({
        push,
        remove
      }) => <div className="flex flex-col gap-6">
            {values.marketplace.offers.map((item, index) => {
          return <div className="flex flex-col items-start w-full gap-4 rounded p-4 relative [box-shadow:var(--gameengine-shadow)]">
                  <div className="flex w-full gap-4">
                    <SettingsInput flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Label", "gameengine")}>
                      <input className="w-full" type="text" min="0" step="1" placeholder={__("Add label", "gameengine")} value={item.label} onChange={event => {
                  const rawValue = event.target.value;
                  setFieldValue(`marketplace.offers[${index}].label`, rawValue);
                }} style={commonInput} />
                    </SettingsInput>
                    <SettingsInput flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Offer Type", "gameengine")}>
                      <Select className="gameengine-select gameengine-select--width-full" classNamePrefix="gameengine-select" options={typesArray} value={typesArray?.find(opt => opt.value === item.type)} onChange={option => {
                  setFieldValue(`marketplace.offers[${index}].type`, option.value);
                }} menuPlacement="bottom" />
                    </SettingsInput>
                  </div>
                  <div className="flex w-full gap-4">
                    <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Point Cost", "gameengine")}>
                      <input className="w-full" type="number" min="0" step="1" value={item.point_cost} onChange={event => {
                  const rawValue = event.target.value;
                  setFieldValue(`marketplace.offers[${index}].point_cost`, Number(rawValue));
                }} style={commonInput} />
                    </SettingsInput>
                    <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Amount", "gameengine")}>
                      <input className="w-full" type="number" min="0" step="1" value={item.amount} onChange={event => {
                  const rawValue = event.target.value;
                  setFieldValue(`marketplace.offers[${index}].amount`, Number(rawValue));
                }} style={commonInput} />
                    </SettingsInput>
                    <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Expiry Days", "gameengine")}>
                      <input className="w-full" type="number" min="0" step="1" value={item.expiry_days} onChange={event => {
                  const rawValue = event.target.value;
                  setFieldValue(`marketplace.offers[${index}].expiry_days`, Number(rawValue));
                }} style={commonInput} />
                    </SettingsInput>
                  </div>
                  <button className="rounded-full absolute p-0 [border:1px_solid_var(--gameengine-border-color)]" style={{
              "top": "-15px",
              "right": "-15px",
              "minWidth": "30px",
              "height": "30px",
              "background": "#ffffff",
              ...clearBtn
            }} onClick={() => remove(index)}>
                    <Icon as={MdDelete} color={'var(--gameengine-border-color)'} _hover={{
                color: 'red.400'
              }} />
                  </button>
                </div>;
        })}
          </div>}
      </FieldArray>
    </div>;
};
export default MarketplaceFields;