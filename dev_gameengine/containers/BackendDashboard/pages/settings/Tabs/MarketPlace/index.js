import { Box, Button, Flex, Input, Switch, Text } from '@chakra-ui/react';
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
      <Text
          fontSize="20px"
          fontWeight="500"
          color="var(--gameengine-font-color)"
          lineHeight="30px"
          margin='0 0 24px 0' 
          padding='0 0 16px 0'
          borderBottom="1px solid var(--gameengine-border-color)"
      >
          {__("Coupon Generate", "gameengine")}
      </Text>
      
      <Flex direction="column" gap='16px'>
        <SettingsInput isPro={!is_pro} label={__("Enable Coupon Generate", "gameengine")}
          subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Activate the rewards store where users can exchange points for unique WooCommerce discount coupons via shortcode.', 'gameengine')} />}
        >
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
          <Flex direction="column" gap={1} margin='0 0 12px 0' padding='0 0 12px 0' width="100%" borderBottom="1px solid var(--gameengine-border-color)">
            <Text fontSize="1rem" fontWeight="600" margin={0} color="var(--gameengine-font-color)">{__('Offers', 'gameengine')}</Text>
            <GFLabel type="subtitle" color="var(--gameengine-warn-muted)" fontSize="0.75rem" margin='0' label={__('Create various coupon offers with specific point costs, discount amounts, and expiry dates.', 'gameengine')} />
          </Flex>

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