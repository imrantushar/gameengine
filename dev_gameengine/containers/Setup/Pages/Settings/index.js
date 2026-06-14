import { Formik } from 'formik';
import React, { useState } from 'react';
import SettingsFooter from './components/SettingsFooter';
import DataPreview from './Steps/DataPreview';
import Addons from './Steps/Addons';
import { API } from '@GFUtils/helper';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [step, setStep] = useState('datapreview');
  const navigate = useNavigate();

  const onSubmitHandler = async (values, actions) => {
    actions.setSubmitting(true);
    try {
      const response = await API.post('/setup/complete', {
        ...values
      });
      if (response.status === 200) {
        navigate('/congratulation');
      }
    } catch (error) {
      console.error(error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full justify-center pb-12 pt-[120px]">
      <Formik 
        enableReinitialize={true} 
        initialValues={{
          preset: "author",
          addons: [],
          setup_completed: true
        }} 
        onSubmit={onSubmitHandler}
      >
        {() => {
          return (
            <div className="w-full max-w-[676px] flex-col justify-center items-center flex gap-8 bg-white rounded-xl p-10 shadow-[0_6px_12px_0_rgba(20,26,36,0.06)] border border-[#F6F7F8]">
              {step === 'datapreview' && <DataPreview />}
              {step === 'addons' && <Addons />}
              <div className="w-full mt-4">
                <SettingsFooter step={step} setStep={setStep} />
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default Settings;