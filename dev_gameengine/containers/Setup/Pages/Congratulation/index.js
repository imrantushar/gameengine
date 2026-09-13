import GFLabel from '@GFComponents/Labels/GFLabel';
import { admin_url, plugin_root_url } from '@GFUtils/helper';
import { __, sprintf } from '@wordpress/i18n';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { clearBtn } from '../../../../../assets/scss/chakra/recipe';
import Button from '@GFComponents/Button';
import { FaArrowRightLong } from 'react-icons/fa6';

/**
 * One line per thing setup created. Empty after a reload, when the router
 * state is gone.
 *
 * @param {Object|null} created What setup created, from the router state.
 * @return {string[]} Lines to show.
 */
const summary = (created) => {
  if (!created) {
    return [];
  }

  const lines = [];
  const existing = (item) => (item && item.created === false ? ` ${__('(already there)', 'gameengine')}` : '');

  if (created.point_type) {
    lines.push(
      (created.rule
        ? sprintf(
          /* translators: 1: point type name, 2: number of points, 3: an action such as "publishes a post" */
          __('%1$s: +%2$d each time someone %3$s', 'gameengine'),
          created.point_type.name,
          created.rule.points,
          created.rule.trigger_label
        )
        : created.point_type.name) + existing(created.point_type)
    );
  }

  if (created.achievements?.length) {
    lines.push(
      sprintf(
        /* translators: %s: achievement names, comma separated */
        __('Achievements: %s', 'gameengine'),
        created.achievements.map((item) => item.title).join(', ')
      )
    );
  }

  if (created.levels?.length) {
    lines.push(
      sprintf(
        /* translators: %s: level names with their point ranges, comma separated */
        __('Levels: %s', 'gameengine'),
        created.levels.map((item) => `${item.title} (${item.min}–${item.max})`).join(', ')
      )
    );
  }

  return lines;
};

const Congratulation = () => {
  const location = useLocation();
  const lines = summary(location?.state?.created);

  return (
    <div className="w-full flex-col justify-center items-center h-full flex gap-6 px-6 pt-[120px]">
      <div className="flex w-full flex-col items-center rounded-xl gap-6 bg-white" style={{
        "maxWidth": "960px",
        "padding": "64px 40px",
        "boxShadow": " 0 6px 12px 0 rgba(20, 26, 36, 0.06)",
        "border": "1px solid #F6F7F8"
      }}>
        <img className="h-auto" style={{
          "maxWidth": "80px"
        }} src={plugin_root_url + 'assets/images/blue_check.svg'} alt="" />
        <div className="flex flex-col items-center text-center gap-1">
          <GFLabel type="simpleHeading" margin={0} padding={0} label={__('Congratulations', 'gameengine')} fontSize={'38px'} lineHeight={'38px'} color={'#006BFF'} />
          <GFLabel type="simple" margin={0} padding={0} label={lines.length ? __('GameEngine created this for you:', 'gameengine') : __('Your GameEngine is ready.', 'gameengine')} fontSize={'16px'} lineHeight={'24px'} textAlign={'center'} />
        </div>

        {lines.length > 0 && (
          <ul className="list-none m-0 p-4 w-full flex flex-col gap-2 rounded-lg bg-[#F3F5FF]">
            {lines.map((line) => (
              <li key={line} className="m-0 text-sm leading-6 text-[#475569]">{line}</li>
            ))}
          </ul>
        )}

        <p className="m-0 text-sm text-center text-[#475569]">
          {__('Next, the Dashboard’s Get started card gives you test points to see it work and a page to show your members.', 'gameengine')}
        </p>

        <div className="flex w-full justify-center gap-4">
          <button
            className="flex items-center gap-2 cursor-pointer p-[2px_16px] !border-[transparent] border-solid rounded-sm h-[42px]"
            {...clearBtn}
            onClick={() => {
              window.location.href = admin_url + 'admin.php?page=gameengine-tools&path=how-it-works';
            }}
          >
            {__('How GameEngine works', 'gameengine')}
          </button>
          <Button
            label={__('Go to the Dashboard', 'gameengine')}
            icon={<FaArrowRightLong />}
            iconPosition="right"
            style={{ fontSize: '12px', fontWeight: '400' }}
            onClick={() => {
              window.location.href = admin_url + 'admin.php?page=gameengine';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Congratulation;
