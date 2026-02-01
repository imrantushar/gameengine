import React from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';

const DataPreview = () => {
  return (
    <>
      <SettingsHeader
        title={__('Setup Your EameEngine', 'gemboards')}
        subTitle={__('Choose your preferred gamification setup', 'gemboards')}
      />
      
    </>
  );
};

export default DataPreview;