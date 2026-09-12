import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { achievement, minus, star, trophy, user } from '@GFUtils/icons';
import Datepicker from '@kodezen/react-datepicker';

function Overview({
  data,
  onFilterChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) {
  useEffect(() => {
    if (startDate && endDate) {
      onFilterChange(startDate, endDate);
    }
  }, [startDate, endDate]);

  // `iconColor` is the colour of the circle behind the icon, not of the icon
  // itself: these glyphs are multi-colour SVGs with baked-in white strokes, so
  // they only read against a solid disc.
  const cards = [{
    label: __('Points Given', 'gameengine'),
    value: data?.points || "0",
    icon: star,
    iconColor: "#F3C838"
  }, {
    label: __('Points Deducted', 'gameengine'),
    value: data?.points_deducted || "0",
    icon: minus,
    iconColor: "#FF9381"
  }, {
    label: __('Achievements Given', 'gameengine'),
    value: data?.achievements || "0",
    icon: achievement,
    iconColor: "#4BC0F8"
  }, {
    label: __('Levels Given', 'gameengine'),
    value: data?.levels || "0",
    icon: trophy,
    iconColor: "#46AD92"
  }, {
    label: __('Active Users', 'gameengine'),
    value: data?.active_users || "0",
    icon: user,
    iconColor: "var(--gameengine-primary)"
  }];

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <p className='text-[20px] font-semibold leading-[30px] m-0 text-[var(--gameengine-font-color)]'>
          {__('Overview', 'gameengine')}
        </p>

        <div className="custom-datepicker flex w-full sm:w-[280px]">
          <Datepicker
            value={{ startDate, endDate }}
            onChange={(val) => {
              setStartDate(val?.startDate ?? null);
              setEndDate(val?.endDate ?? null);
            }}
            theme="light"
            placement="left"
            suffix='dashboard'
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) =>
          <div className="gameengine-count-cards" key={i}>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-[24px] font-medium leading-[32px] m-0 text-[var(--gameengine-font-color)]">
                {card?.value}
              </p>
              <p className="text-sm leading-5 m-0 text-[var(--gameengine-warn-muted)]">
                {card?.label}
              </p>
            </div>

            <span
              className='gameengine-count-cards__icon'
              style={{ background: card?.iconColor }}
            >
              {card?.icon()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;
