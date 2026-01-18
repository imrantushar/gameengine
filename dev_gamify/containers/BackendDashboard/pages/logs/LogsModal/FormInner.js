import { Flex, Input, Textarea } from '@chakra-ui/react';
import GamifyInput from '@GFComponents/GamifyInput';
import React from 'react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { useFormikContext } from 'formik';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';

const FormInner = () => {
  const { values, setFieldValue } = useFormikContext();

  const userOptions = [
      { value: 1, label: __("User 1", 'gamify') },
      { value: 2, label: __("User 2", 'gamify') },
      { value: 3, label: __("User 3", 'gamify') },
  ];

  return (
    <Flex direction={'column'} gap={'12px'}>
      <Flex gap={4}>
          <GamifyInput label={__("User ID", "gamify")}>
              <Select
                classNamePrefix='gamify-select'
                className='gamify-select'
                placeholder="e.g. 1"
                options={userOptions}
                value={userOptions.find(opt => opt.value === values?.user_id)}
                onChange={(selected) =>
                    setFieldValue(
                      "user_id",
                      selected.value
                    )
                }
                isDisabled={values?.id}
                styles={{
                    container: (base) => ({
                        ...base,
                        width: "100%",
                        opacity: values?.id ? 0.6 : 1,
                    }),
                }}
              />
          </GamifyInput>

          <GamifyInput label={__("Action Type", "gamify")}>
              <Select
                  classNamePrefix='gamify-select'
                  className='gamify-select'
                  defaultValue={values?.type}
                  onChange={(val) => setFieldValue("type", val?.value )}
                  options={[
                      { label: __('Award Points (+)', 'gamify'), value: 'award' },
                      { label: __('Deduct Points (-)', 'gamify'), value: 'deduct' },
                  ]}
              />
          </GamifyInput>
      </Flex>

      <Flex gap={4}>
          <GamifyInput label={__("Points Amount", "gamify")}>
              <Input
                  placeholder={__("Exp: 50", "gamify")}
                  type="number"
                  value={values?.points_awarded}
                  onChange={(e) => setFieldValue("points_awarded", e.target.value )}
                  {...commonInput}
              />
          </GamifyInput>

          {!values?.id && (
              <GamifyInput label={__("Schedule(Optional)", "gamify")}>
                  <Input
                      placeholder={__("Exp: 50", "gamify")}
                      type="datetime-local"
                      value={values?.schedule_date}
                      onChange={(e) => setFieldValue("schedule_date", e.target.value )}
                      {...commonInput}
                  />
              </GamifyInput>
          )}
      </Flex>

      <GamifyInput label={__("Description(Optional)", "gamify")}>
          <Textarea
              placeholder={__("Reason for adjustment...", "gamify")}
              size="md"
              minH="100px"
              value={values?.message}
              onChange={(e) => setFieldValue('message', e.target.value )}
          />
      </GamifyInput>
    </Flex>
  );
};

export default FormInner;