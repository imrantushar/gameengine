import React from 'react';
import { __ } from '@wordpress/i18n';
import HowItWorks from '@GFComponents/HowItWorks';

const HowItWorksTab = () => (
  <div className="flex flex-col gap-6">
    <p className="m-0 text-sm leading-6 text-[var(--gameengine-font-color)]">
      {__('GameEngine turns activity on your site into rewards in five steps. Each step links to the screen that controls it.', 'gameengine')}
    </p>
    <HowItWorks />
  </div>
);

export default HowItWorksTab;
