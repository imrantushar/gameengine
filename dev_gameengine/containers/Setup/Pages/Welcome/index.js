import React, { useState } from 'react';
import { admin_url, plugin_root_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { LiaUserEditSolid } from 'react-icons/lia';
import { TbStar } from 'react-icons/tb';
import { FaAngleRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Button from '@GFComponents/Button';
import HowItWorks from '@GFComponents/HowItWorks';

const cards = [{
  icon: LiaUserEditSolid,
  value: 'manual',
  label: __("I'll Configure Manually", 'gameengine'),
  description: __("Create your own gamification setup from scratch with full control", 'gameengine')
}, {
  icon: TbStar,
  value: 'genatative',
  label: __('Jumpstart with Demo Data', 'gameengine'),
  description: __('Creates a starter point type, a rule, 4 achievements and 4 levels. They are real, and you can edit or delete them.', 'gameengine')
}];

const Welcome = () => {
  const [selectedCard, setSelectedCard] = useState('genatative');
  const navigate = useNavigate();

  return (
    <div className="gameengine-setup-screen w-full flex-col justify-center items-center h-full flex gap-6 px-6">
      <div className="flex w-full max-w-[960px] flex-col items-center rounded-xl gap-6 p-8 bg-white shadow-[0_6px_12px_0_rgba(20,26,36,0.06)] border border-[#F6F7F8]">
        <div className="flex flex-col items-center gap-3">
          <img className="h-auto max-w-[36px]" src={plugin_root_url + 'assets/images/logo.svg'} alt="Logo" />
          <div className="flex flex-col items-center gap-2">
            <GFLabel type="heading" margin={0} padding={0} fontSize={'38px'} lineHeight={'38px'} label={__('Welcome to GameEngine 👋', 'gameengine')} borderBottom={'none'} />
            <GFLabel type="simple" margin={0} padding={0} lineHeight={'24px'} textAlign={'center'} label={__('You are just a few clicks away from turning activity on your site into points, achievements and levels.', 'gameengine')} />
          </div>
        </div>

        <HowItWorks compact />

        <div className="w-full h-px bg-[#E0E4E8]" />

        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          {cards.map((item, idx) => {
            const isSelected = selectedCard === item.value;
            return (
              <div
                className={`flex flex-col items-center gap-4 p-6 rounded-lg text-center relative border border-solid border-[var(--gameengine-border-color)] transition-all cursor-pointer w-full sm:flex-1 ${isSelected ? '!border-[var(--gameengine-primary)] bg-[#F3F5FF]' : ''}`}
                key={idx}
                onClick={() => setSelectedCard(item.value)}
              >
                <item.icon size={32} className="text-[var(--gameengine-primary)]" />
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
          label={__("Continue", "gameengine")}
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
