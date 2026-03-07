import { Box, Button, Flex, Input, Switch } from '@chakra-ui/react';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import React from 'react';
import SettingsInput from '../../Components/SettingsInput';
import { useFormikContext } from 'formik';
import MarketplaceFields from './MarketplaceFields';
import { clearBtn, commonInput, primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { is_pro } from '@GFUtils/helper';
import Select from 'react-select';

const MarketPlace = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
    <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)">
      <GFLabel type="heading" margin='0 0 24px 0' padding='0 0 16px 0' label={__("Coupon Generate", "gameengine")} />
      <Flex direction="column" gap='16px'>
        <SettingsInput isPro={!is_pro} label={__("Enable Coupon Generate", "gameengine")}>
          <Switch.Root
            colorPalette="blue"
            size="sm"
            mt="0.5"
            disabled={!is_pro}
            aria-label="Select row"
            checked={values?.marketplace?.enable_marketplace}
            onCheckedChange={(changes) => {
              setFieldValue('marketplace.enable_marketplace', changes.checked)
            }}
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </SettingsInput>
      </Flex>

      {(values?.marketplace?.enable_marketplace || !is_pro) && (
        <Flex direction="column" gap='16px' alignItems={'flex-start'} marginTop={'24px'} width={'100%'}>
          <GFLabel type="heading" fontSize={'16px'} padding={'0 0 12px 0'} width={'100%'} margin='0 0 12px 0' label={__("Offers", "gameengine")} />

          {(!!values?.marketplace?.offers.length && is_pro) ? (
            <MarketplaceFields />
          ) : (
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
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Label", "gameengine")}>
                  <Input
                    type="text"
                    min="0"
                    step="1"
                    width="100%"
                    disabled={!is_pro}
                    placeholder={__("Add label", "gameengine")}
                    {...commonInput}
                  />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Offer Type", "gameengine")}>
                  <Select
                    className="gameengine-select gameengine-select--width-full"
                    classNamePrefix="gameengine-select"
                    isDisabled={!is_pro}
                    menuPlacement="bottom"
                  />
                </SettingsInput>
              </Flex>
              <Flex gap='16px' width="100%">
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Point Cost", "gameengine")}>
                  <Input
                    type="number"
                    min="0"
                    step="1" isPro={!is_pro}
                    placeholder={__("0", "gameengine")}
                    width="100%"
                    disabled={!is_pro}
                    {...commonInput}
                  />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Amount", "gameengine")}>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={__("0", "gameengine")}
                    width="100%"
                    disabled={!is_pro}
                    {...commonInput}
                  />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Expiry Days", "gameengine")}>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={__("0", "gameengine")}
                    width="100%"
                    disabled={!is_pro}
                    {...commonInput}
                  />
                </SettingsInput>
              </Flex>
            </Flex>
          )}
          {is_pro && (
            <Button
              {...primaryBtn}
              onClick={() => {
                setFieldValue('marketplace.offers', [...values.marketplace.offers, {
                  label: "",
                  points_cost: 0,
                  amount: 0,
                  type: "",
                  expiry_days: 0,
                }])
              }}
            >
              {__('Add Offer', 'gameengine')}
            </Button>
          )}
        </Flex>
      )}
    </GameEngineBox>
  );
};

export default MarketPlace;