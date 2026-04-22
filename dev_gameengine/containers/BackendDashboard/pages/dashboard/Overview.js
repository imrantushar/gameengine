import React, { useEffect } from 'react';
import { Icon } from '@GFUtils/ui';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar, FiCalendar, FiMinusCircle } from "react-icons/fi";
import BoxView from '@GFComponents/BoxView/BoxView';
import { achievement, star, trophy, user } from '@GFUtils/icons';
import DateTimePicker from '@GFComponents/DateTimePicker';
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
    icon: FiMinusCircle,
    bg: "red.50",
    iconColor: "red.500"
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
  return <>
            <BoxView width='100%' title={__('Overview', 'gameengine')} rightContent={<div className="flex items-center cursor-pointer gap-2 rounded [border:1px_solid_var(--gameengine-border-color)]" style={{
      "padding": "10px 12px"
    }}>
                        <div className="custom-datepicker flex w-full">
                            <DateTimePicker startDate={startDate} endDate={endDate} onChange={nd => {
          setStartDate(nd.startDate);
          setEndDate(nd.endDate);
        }} primaryColor="blue" variant='auto-show' />
                        </div>
                    </div>}>
                <div className="flex flex-wrap gap-4 p-2">
                    {cards.map((card, i) => <div className="flex items-center justify-between gap-6 shrink-0 rounded [box-shadow:var(--gameengine-shadow)]" style={{
          "padding": "32px 24px",
          "background": card?.bg
        }} key={i} flexBasis="calc((100% - 48px) / 4)">
                            <div className="flex flex-col gap-1">
                                <p className="text-3xl font-bold m-0" style={{
              "lineHeight": "38px"
            }}>{card?.value}</p>
                                <p className="text-base font-medium leading-6 m-0">{card?.label}</p>
                            </div>
                            <div className="rounded-full" style={{
            "padding": "14px",
            "background": card?.iconColor
          }}>
                                <Icon as={card?.icon} boxSize={8} color="#fff" />
                            </div>
                        </div>)}
                </div>
            </BoxView>
        </>;
}
export default Overview;