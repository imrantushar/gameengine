import { Formik } from 'formik';
import React, { useState } from 'react';
import SettingsHeader from './components/SettingsHeader';
import SettingsFooter from './components/SettingsFooter';
import DataPreview from './Steps/DataPreview';
import Addons from './Steps/Addons';
import { API, namespace } from '@GFUtils/helper';
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
  return <div className="flex w-full justify-center">
      <Formik enableReinitialize={true} initialValues={{
      preset: "author",
      addons: [],
      setup_completed: true
    }} onSubmit={onSubmitHandler}>
        {() => {
        return <div className="w-full flex-col justify-center items-center flex gap-6 bg-white rounded-xl" style={{
          "maxWidth": "676px",
          "padding": "40px",
          "border": "1px solid #F6F7F8"
        }}>
              {step === 'datapreview' && <DataPreview />}
              {step === 'addons' && <Addons />}
              <SettingsFooter step={step} setStep={setStep} />
            </div>;
      }}
      </Formik>
    </div>;
};
export default Settings;