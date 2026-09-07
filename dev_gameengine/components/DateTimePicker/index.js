import '../../../assets/scss/tailwind.scss';

import React from "react";
import Datepicker from "react-advance-datepicker";

const DateTimePicker = ({ 
  variant = "input", // IF YOU WANT SHOW THE DATE PICKER DIRECTLY, DECLARE ANY VARIANT YOU WANT EXCEPT "input"
  startDate, 
  endDate, 
  onChange, 
  isDisabled = false, 
  ...props 
}) => {
  const normalizedValue = {
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(),
  };
  return (
    <Datepicker
      inputClassName="w-[250px] !border-0 !outline-none !shadow-none focus:!outline-none focus:!shadow-none focus:!ring-0 !px-0 !py-0"
      primaryColor="blue"
      value={normalizedValue}
      maxDate={new Date()}
      onChange={onChange}
      disabled={isDisabled}
      showShortcuts={true} 
      showFooter={true} 
      {...props}
    />
  );
};

export default DateTimePicker;
