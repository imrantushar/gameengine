import { Icon } from '@GFUtils/ui';
import React, { useState } from 'react';
import { admin_url, plugin_root_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { LiaUserEditSolid } from 'react-icons/lia';
import { TbStar } from 'react-icons/tb';
import { FaAngleRight } from 'react-icons/fa6';
import { clearBtn, primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { useNavigate } from 'react-router-dom';
const cards = [{
  icon: LiaUserEditSolid,
  value: 'manual',
  label: __("I'll Configure Manually", 'gameengine'),
  description: __("Create your own gamification setup from scratch with full control", 'gameengine')
}, {
  icon: TbStar,
  value: 'genatative',
  label: __('Jumpstart with Demo Data', 'gameengine'),
  description: __('This demo gamification is for preview only no real rewards applied', 'gameengine')
}];
const Welcome = () => {
  const [selectedCard, setSelectedCard] = useState('genatative');
  const navigate = useNavigate();
  return <div className="w-full flex-col justify-center items-center h-full flex gap-6">
      <div className="flex w-full flex-col items-center rounded-xl gap-6" style={{
      "maxWidth": "680px",
      "padding": "40px",
      "boxShadow": " 0 6px 12px 0 rgba(20, 26, 36, 0.06)",
      "border": "1px solid #F6F7F8"
    }}>
        <div className="flex flex-col items-center gap-4">
          <img className="h-auto" style={{
          "maxWidth": "36px"
        }} src={plugin_root_url + 'assets/images/logo.svg'} />
          <div className="flex flex-col items-center gap-2">
            <GFLabel type="heading" margin={0} padding={0} fontSize={'38px'} lineHeight={'38px'} label={__('Welcome to GameEngine 👋', 'gemboards')} borderBottom={'none'} />
            <GFLabel type="simple" margin={0} padding={0} lineHeight={'28px'} textAlign={'center'} label={__('You are just a few clicks away from transforming your website into a powerful e-commerce platform.', 'gemboards')} />
          </div>
        </div>
        <div className="w-full h-px" style={{
        "background": "#E0E4E8"
      }} />
        <div className="flex gap-6">
          {cards.map((item, idx) => {
          const isSelected = selectedCard === item.value;
          return <div className="flex flex-col items-center gap-4 p-4 rounded text-center relative" style={{
            "maxWidth": "280px",
            "border": `1px solid ${isSelected ? 'var(--gameengine-primary)' : '#E0E4E8'}`,
            "background": isSelected && '#F3F5FF'
          }} key={idx} onClick={() => setSelectedCard(item.value)}>
                <Icon as={item.icon} />
                <GFLabel type="simpleHeading" margin={0} padding={0} label={item.label} fontSize={'16px'} lineHeight={'24px'} />
                <GFLabel type="simple" margin={0} padding={0} label={item.description} lineHeight={'24px'} />
                {isSelected && <div className="absolute w-5 h-5 rounded-full [border:4px_solid_var(--gameengine-primary)]" style={{
              "top": "8px",
              "right": "8px"
            }}></div>}
              </div>;
        })}
        </div>
        <button {...primaryBtn} onClick={() => {
        if (selectedCard === 'manual') {
          window.location.href = admin_url + 'admin.php?page=gameengine-points';
        } else {
          navigate('/settings');
        }
      }}>
          {__("Process to Next", "gameengine")}
          <Icon as={FaAngleRight} />
        </button>
      </div>
      <button className="text-sm font-medium leading-5" {...clearBtn} onClick={() => window.location.href = admin_url + 'admin.php?page=gameengine'}>
          {__("Skip This Step", "gameengine")}
        </button>
    </div>;
};
export default Welcome;