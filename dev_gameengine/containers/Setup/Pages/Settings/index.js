import { Formik } from 'formik';
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import SettingsFooter from './components/SettingsFooter';
import DataPreview from './Steps/DataPreview';
import Addons from './Steps/Addons';
import { API } from '@GFUtils/helper';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [step, setStep] = useState('datapreview');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = async (values, actions) => {
    actions.setSubmitting(true);
    setError('');
    try {
      const response = await API.post('/setup/complete', {
        ...values
      });
      if (response.status === 200) {
        navigate('/congratulation', { state: { created: response.data?.created || null } });
      }
    } catch (e) {
      // The person running setup has to see this; the console is invisible to them.
      setError(e?.response?.data?.message || __('Setup could not finish. Please try again.', 'gameengine'));
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="gameengine-setup-screen flex w-full justify-center px-6 pb-6">
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
            <div className="w-full max-w-[960px] flex-col justify-center items-center flex gap-6 bg-white rounded-xl p-8 shadow-[0_6px_12px_0_rgba(20,26,36,0.06)] border border-[#F6F7F8]">
              {step === 'datapreview' && <DataPreview />}
              {step === 'addons' && <Addons />}
              {error && (
                <p role="alert" className="w-full m-0 p-3 rounded text-sm bg-[#FEF2F2] text-[#991B1B] border border-solid border-[#FECACA]">
                  {error}
                </p>
              )}
              <div className="w-full">
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
