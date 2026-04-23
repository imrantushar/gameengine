import { Icon } from "@GFComponents/UI";
import React from "react";
import { clearBtn, primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { __ } from "@wordpress/i18n";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useFormikContext } from "formik";
import { useNavigate } from "react-router-dom";
const SettingsFooter = ({
  step,
  setStep
}) => {
  const {
    submitForm,
    isSubmitting
  } = useFormikContext();
  const navigate = useNavigate();
  return <div className="flex w-full justify-between items-center">
      <button className="text-sm font-medium leading-5" {...clearBtn} onClick={() => {
      if (step === "addons") {
        setStep("datapreview");
      } else if (step === "datapreview") {
        navigate("/");
      }
    }}>
        <Icon as={FaAngleLeft} width={"10px"} />
        {__("Back", "gameengine")}
      </button>
      <button {...primaryBtn} onClick={() => {
      if (step === "datapreview") {
        setStep("addons");
      } else {
        submitForm();
      }
    }}>
        {__("Continue", "gameengine")}
        <Icon as={FaAngleRight} width={"10px"} />
      </button>
    </div>;
};
export default SettingsFooter;