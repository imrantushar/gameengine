import { Box, Button, Flex, Switch } from '@chakra-ui/react';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import React from 'react';
import SettingsInput from '../../Components/SettingsInput';
import { useFormikContext } from 'formik';
import MarketplaceFields from './MarketplaceFields';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';

const MarketPlace = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
    <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)">
      <GFLabel type="heading" margin='0 0 24px 0' padding='0 0 16px 0' label={__(" Marketplace", "gameengine")} />
      <Flex direction="column" gap='16px'>
          <SettingsInput label={__("Enable Marketplace", "gameengine")}>
              <Switch.Root
                  colorPalette="blue"
                  size="sm"
                  mt="0.5"
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

      {values?.marketplace?.enable_marketplace && (
        <Flex direction="column" gap='16px' alignItems={'flex-start'} marginTop={'24px'} width={'100%'}>
          <GFLabel type="heading" fontSize={'16px'} padding={'0 0 12px 0'} width={'100%'} margin='0 0 12px 0' label={__("Offers", "gameengine")} />

          {!!values?.marketplace?.offers.length && (
            <MarketplaceFields />
          )}
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
        </Flex>
      )}
    </GameEngineBox>
  );
};

export default MarketPlace;