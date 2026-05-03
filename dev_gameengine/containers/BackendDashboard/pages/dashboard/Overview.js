import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { achievement, minus, star, trophy, user } from '@GFUtils/icons';
import Datepicker from '@kodezen/react-datepicker';
import PlainBox from '@GFComponents/BoxView/PlainBox';

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

  const cards = [{
    label: "Points Given",
    value: data?.points || "0",
    icon: star,
    bg: "yellow.50",
    iconColor: "#F3C838"
  }, {
    label: "Points Deducted",
    value: data?.points_deducted || "0",
    icon: minus,
    bg: "red.50",
    iconColor: "#FF9381"
  }, {
    label: "Achievements Given",
    value: data?.achievements || "0",
    icon: achievement,
    bg: "blue.50",
    iconColor: "#4BC0F8"
  }, {
    label: "Levels Given",
    value: data?.levels || "0",
    icon: trophy,
    bg: "green.50",
    iconColor: "#46AD92"
  }, {
    label: "Active Users",
    value: data?.active_users || "0",
    icon: user,
    bg: "red.50",
    iconColor: "#FF9381"
  }];

  return (
    <>
      <div className='flex items-center justify-between'>
        <p className='text-[20px] font-medium leading-[30px] m-0'>{__('Overview', 'gameengine')}</p>
        <div className="custom-datepicker flex w-1/4">
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

      <PlainBox>
        <div className="flex flex-wrap gap-4">
          {cards.map((card, i) =>
            <div
              className="flex items-center justify-between gap-6 rounded [box-shadow:var(--gameengine-shadow)] p-[32px_24px] w-full md:w-[calc(50%_-_56px)] lg:w-[calc(25%_+_6px)] xl:w-[calc(25%_-_60px)]"
              style={{
                "background": card?.bg
              }}
              key={i}
            >
              <div className="flex flex-col gap-1">
                <p className="text-[30px] font-bold m-0 leading-[38px]" >{card?.value}</p>
                <p className="text-[16px] font-medium leading-6 m-0">{card?.label}</p>
              </div>

              <span className='text-white leading-[12px] p-[12px] rounded-full' style={{ "background": card?.iconColor }}>
                {card?.icon()}
              </span>
            </div>
          )}
        </div>
      </PlainBox>
    </>
  );
}

export default Overview;
