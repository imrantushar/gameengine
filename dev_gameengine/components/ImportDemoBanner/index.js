import { Box, Button, Flex } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { clearBtn, primaryBtn } from '../../../assets/scss/chakra/recipe';

const ImportDemoBanner = ({type, title, subtitle, handleImport, handleClose}) => {
  return (
    <Box
      width={'100%'}
      borderLeft={'2px solid #006BFF'}
      background={'#FFF'}
      padding={'24px'}
      boxShadow={'0 0 1px 0 rgba(20, 26, 36, 0.20), 0 1px 2px 0 rgba(20, 26, 36, 0.10)'}
    >
      <GFLabel 
        type='simpleHeading'
        label={title}
        margin={'0 0 6px 0'}
        fontSize={'20px'}
        lineHeight={'30px'}
      />
      <GFLabel 
        type='simple'
        label={subtitle}
        margin={'0 0 16px 0'}
        fontSize={'16px'}
        lineHeight={'24px'}
      />
      <Flex gap={'12px'}>
        <Button
          {...primaryBtn}
          onClick={handleImport}
        >
          {__("Import Default Data", 'gameengine')}
        </Button>
        <Button
          {...clearBtn}
          padding={'8px 16px'}
          border={'1px solid #CBD1D7'}
          onClick={handleClose}
        >
          {__("No, Thanks!", 'gameengine')}
        </Button>
      </Flex>
    </Box>
  );
};

export default ImportDemoBanner;