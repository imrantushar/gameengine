import { Box, Button, Flex, Icon, Input } from '@chakra-ui/react';
import Select from 'react-select';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from "@wordpress/i18n";
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import SettingsInput from '../../Components/SettingsInput';
import { clearBtn, commonInput } from '../../../../../../../assets/scss/chakra/recipe';
import { MdDelete } from 'react-icons/md';

const typesArray = [
  {
    label: __('Percent', 'gameengine'),
    value: 'percent'
  },
  {
    label: __('Fixed Cart', 'gameengine'),
    value: 'fixed_cart'
  },
]

const MarketplaceFields = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
    <Box 
      width={'100%'}
    >
      <FieldArray 
        name="marketplace.offers"
      >
        {({ push, remove }) => (
          <Flex
            direction="column" 
            gap='24px'
          >
            {values.marketplace.offers.map((item, index) => {
              return (
                <Flex 
                  direction="column" 
                  gap='16px' 
                  alignItems={'flex-start'} 
                  width={'100%'}
                  boxShadow={'var(--gameengine-shadow)'}
                  borderRadius={'4px'}
                  padding={'16px'}
                  position={'relative'}
                >
                  <Flex gap='16px' width="100%">
                      <SettingsInput flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Label", "gameengine")}>
                        <Input
                          type="text"
                          min="0"
                          step="1"
                          width="100%"
                          placeholder={__("Add label", "gameengine")}
                          value={item.label}
                          onChange={(event) => {
                              const rawValue = event.target.value;
                              setFieldValue(
                                  `marketplace.offers[${index}].label`, rawValue
                              );
                          }}
                          {...commonInput}
                      />
                      </SettingsInput>
                      <SettingsInput flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Offer Type", "gameengine")}>
                        <Select
                            className="gameengine-select gameengine-select--width-full"
                            classNamePrefix="gameengine-select"
                            options={typesArray}
                            value={typesArray?.find(opt => opt.value === item.type)}
                            onChange={option => {
                                setFieldValue(`marketplace.offers[${index}].type`, option.value)
                            }}
                            menuPlacement="bottom"
                        />
                      </SettingsInput>
                  </Flex>
                  <Flex gap='16px' width="100%">
                      <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Point Cost", "gameengine")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          width="100%"
                          value={item.point_cost}
                          onChange={(event) => {
                              const rawValue = event.target.value;
                              setFieldValue(
                                  `marketplace.offers[${index}].point_cost`, Number(rawValue)
                              );
                          }}
                          {...commonInput}
                      />
                      </SettingsInput>
                      <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Amount", "gameengine")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          width="100%"
                          value={item.amount}
                          onChange={(event) => {
                              const rawValue = event.target.value;
                              setFieldValue(
                                  `marketplace.offers[${index}].amount`, Number(rawValue)
                              );
                          }}
                          {...commonInput}
                      />
                      </SettingsInput>
                      <SettingsInput flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Expiry Days", "gameengine")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          width="100%"
                          value={item.expiry_days}
                          onChange={(event) => {
                              const rawValue = event.target.value;
                              setFieldValue(
                                  `marketplace.offers[${index}].expiry_days`, Number(rawValue)
                              );
                          }}
                          {...commonInput}
                      />
                      </SettingsInput>
                  </Flex>
                  <Button
                    {...clearBtn}
                    border={'1px solid var(--gameengine-border-color)'}
                    borderRadius={'50%'}
                    position={'absolute'}
                    top={'-15px'}
                    right={'-15px'}
                    minWidth={'30px'}
                    height={'30px'}
                    padding='0'
                    background={'#ffffff'}
                    _hover={{
                      borderColor: "red.400",
                    }}
                    onClick={() => remove(index)}
                  >
                    <Icon as={MdDelete} color={'var(--gameengine-border-color)'} _hover={{ color: 'red.400'}} />
                  </Button>
                </Flex>
              )
            })}
          </Flex>
        )}
      </FieldArray>
    </Box>
  );
};

export default MarketplaceFields;