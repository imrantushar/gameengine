import { Icon } from "@GFComponents/UI";
import React from "react";
import { __ } from "@wordpress/i18n";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useFormikContext } from "formik";
import { useNavigate } from "react-router-dom";
import { outlineBtn, primaryBtn } from "../../../../../../assets/scss/chakra/recipe";

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
      <button
        className="flex items-center gap-2 cursor-pointer"
        style={primaryBtn}
        disabled={isSubmitting}
        onClick={() => {
          if (step === "datapreview") {
            setStep("addons");
          } else {
            submitForm();
          }
        }}
      >
        {__("Continue", "gameengine")}
        <Icon as={FaAngleRight} width={"10px"} color={'#fff'}/>
      </button>
    </div>
  );
};

export default SettingsFooter;