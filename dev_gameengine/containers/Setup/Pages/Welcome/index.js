import React, { useState } from 'react';
import { admin_url, plugin_root_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { LiaUserEditSolid } from 'react-icons/lia';
import { TbStar } from 'react-icons/tb';
import { FaAngleRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Button from '@GFComponents/Button';

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

  return (
    <div className="w-full flex-col justify-center items-center h-full flex gap-6 pt-[120px]">
      <div className="flex w-full max-w-[680px] flex-col items-center rounded-xl gap-8 p-10 bg-white shadow-[0_6px_12px_0_rgba(20,26,36,0.06)] border border-[#F6F7F8]">
        <div className="flex flex-col items-center gap-4">
          <img className="h-auto max-w-[36px]" src={plugin_root_url + 'assets/images/logo.svg'} alt="Logo" />
          <div className="flex flex-col items-center gap-2">
            <GFLabel type="heading" margin={0} padding={0} fontSize={'38px'} lineHeight={'38px'} label={__('Welcome to GameEngine 👋', 'gameengine')} borderBottom={'none'} />
            <GFLabel type="simple" margin={0} padding={0} lineHeight={'28px'} textAlign={'center'} label={__('You are just a few clicks away from transforming your website into a powerful e-commerce platform.', 'gameengine')} />
          </div>
        </div>

        <div className="w-full h-px bg-[#E0E4E8]" />

        <div className="flex gap-6 w-full justify-center">
          {cards.map((item, idx) => {
            const isSelected = selectedCard === item.value;
            return (
              <div
                className={`flex flex-col items-center gap-4 p-5 rounded-lg text-center relative border border-solid border-[var(--gameengine-border-color)] transition-all cursor-pointer w-full max-w-[280px] ${isSelected ? '!border-[var(--gameengine-primary)] bg-[#F3F5FF]' : ''}`}
                key={idx}
                onClick={() => setSelectedCard(item.value)}
              >
                {item.icon}
                <GFLabel type="simpleHeading" margin={0} padding={0} label={item.label} fontSize={'16px'} lineHeight={'24px'} />
                <GFLabel type="simple" margin={0} padding={0} label={item.description} lineHeight={'24px'} />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-[4px] border-[var(--gameengine-primary)]"></div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          label={__("Process to Next", "gameengine")}
          icon={<FaAngleRight />}
          iconPosition="right"
          onClick={() => {
            if (selectedCard === 'manual') {
              window.location.href = admin_url + 'admin.php?page=gameengine-points';
            } else {
              navigate('/settings');
            }
          }}
        />
      </div>

      <p className="text-md cursor-pointer"
        onClick={() => window.location.href = admin_url + 'admin.php?page=gameengine'}
      >
        {__("Skip This Step", "gameengine")}
      </p>
    </div>
  );
};

export default Welcome;
