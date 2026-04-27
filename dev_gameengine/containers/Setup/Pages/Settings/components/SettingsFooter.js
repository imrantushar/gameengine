import { Icon } from "@GFComponents/UI";
import React from "react";
import { __ } from "@wordpress/i18n";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useFormikContext } from "formik";
import { useNavigate } from "react-router-dom";
import { outlineBtn } from "../../../../../../assets/scss/chakra/recipe";
import Button from "@GFComponents/Button";

const SettingsFooter = ({ step, setStep }) => {
  const { submitForm, isSubmitting } = useFormikContext();
  const navigate = useNavigate();

  return (
    <div className="flex w-full justify-between items-center mt-2">
      <button
        className="flex items-center gap-2 cursor-pointer"
        style={outlineBtn}
        onClick={() => {
          if (step === "addons") {
            setStep("datapreview");
          } else if (step === "datapreview") {
            navigate("/");
          }
        }}
      >
        <Icon as={FaAngleLeft} width={"10px"} />
        {__("Back", "gameengine")}
      </button>
      <Button
        label={__('Continue', 'gameengine')}
        loadingLabel={__('Continue', 'gameengine')}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        icon={<Icon as={FaAngleRight} width={'10px'} color={'#fff'} />}
        iconPosition="right"
        onClick={() => {
          if (step === "datapreview") {
            setStep("addons");
          } else {
            submitForm();
          }
        }}
      />
    </div>
  );
};

export default SettingsFooter;