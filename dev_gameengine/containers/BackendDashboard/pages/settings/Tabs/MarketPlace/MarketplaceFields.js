import React from 'react';
import Select from 'react-select';
import { __ } from "@wordpress/i18n";
import { FieldArray, useFormikContext } from 'formik';
import { BsTrash } from 'react-icons/bs';

const typesArray = [{
  label: __('Percent', 'gameengine'),
  value: 'percent'
}, {
  label: __('Fixed Cart', 'gameengine'),
  value: 'fixed_cart'
}];

const MarketplaceFields = () => {
  const { values, setFieldValue } = useFormikContext();

  return <div className="w-full">
    <FieldArray name="marketplace.offers">
      {({ push, remove }) => <div className="flex flex-col gap-6">
        {values.marketplace.offers.map((item, index) => {
          return (
            <div className='relative'>
              <div className="flex flex-col items-start w-[calc(100%-32px)] gap-4 rounded p-4 relative [box-shadow:var(--gameengine-shadow)]">
                <div className="flex w-full gap-4">
                  <div className="flex flex-col gap-1 w-[calc((100%/2)-12px)]">
                    <p className='text-[14px] font-medium m-0'>{__("Label", "gameengine")}</p>
                    <input
                      className="gameengine-input"
                      type="text"
                      min="0"
                      step="1"
                      placeholder={__('Add label', 'gameengine')}
                      value={item.label}
                      onChange={event => {
                        const rawValue = event.target.value;
                        setFieldValue(`marketplace.offers[${index}].label`, rawValue);
                      }} />
                  </div>

                  <div className="flex flex-col gap-1 w-[calc((100%/2)-12px)]">
                    <p className='text-[14px] font-medium m-0'>{__("Offer Type", "gameengine")}</p>
                    <Select
                      className="gameengine-select gameengine-select--width-full"
                      classNamePrefix="gameengine-select"
                      options={typesArray}
                      value={typesArray?.find(opt => opt.value === item.type)}
                      onChange={option => {
                        setFieldValue(`marketplace.offers[${index}].type`, option.value);
                      }}
                      menuPlacement="auto"
                    />
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <div className="flex flex-col gap-1 w-[calc((100%/3)-12px)]">
                    <p className='text-[14px] font-medium m-0'>{__("Point Cost", "gameengine")}</p>
                    <input
                      className="gameengine-input"
                      type="number"
                      min="0"
                      step="1"
                      value={item.point_cost}
                      onChange={event => {
                        const rawValue = event.target.value;
                        setFieldValue(`marketplace.offers[${index}].point_cost`, Number(rawValue));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-[calc((100%/3)-12px)]">
                    <p className='text-[14px] font-medium m-0'>{__("Amount", "gameengine")}</p>
                    <input
                      className="gameengine-input"
                      type="number"
                      min="0"
                      step="1"
                      value={item.amount}
                      onChange={event => {
                        const rawValue = event.target.value;
                        setFieldValue(`marketplace.offers[${index}].amount`, Number(rawValue));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-[calc((100%/3)-12px)]">
                    <p className='text-[14px] font-medium m-0'>{__("Expiry Days", "gameengine")}</p>
                    <input
                      className="gameengine-input"
                      type="number" min="0" step="1"
                      value={item.expiry_days}
                      onChange={event => {
                        const rawValue = event.target.value;
                        setFieldValue(`marketplace.offers[${index}].expiry_days`, Number(rawValue));
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                className="rounded-full absolute top-[-16px] right-[-16px] p-3 [border:1px_solid_var(--gameengine-border-color)] text-xs text-red-400 bg-transparent"
                onClick={() => remove(index)}
              >
                <BsTrash size="16px" />
              </button>
            </div>
          );
        })}
      </div>}
    </FieldArray>
  </div>;
};

export default MarketplaceFields;
