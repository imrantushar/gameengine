import React from 'react';
import { __ } from '@wordpress/i18n';
import { manualLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import ReactModalFormik from '@GFComponents/Modal/ReactModalFormik';
import { getLogsInitailaValues } from './helper';
import FormInner from './FormInner';
import { useDispatch } from 'react-redux';

const LogsModal = ({formData, isModalOpen, setIsModalOpen}) => {
  const id = formData?.id ;
  const dispatch = useDispatch();

  const onSubmitHandler = async (values, actions) => {
    if (!values?.user_id && !values?.id) {
      alert(__('User ID is required', 'gamify'));
      return;
    }
    
    actions.setSubmitting(true)
    try {
      if (!values.id) {
        await dispatch(manualLogAction(values));
      } else {
        await dispatch(updateLogAction(values));
      }
    } catch (error) {
      console.warn({error})
    } finally {
      actions.setSubmitting(false)
    }
  };
  
  return (
    <ReactModalFormik
      suffix='logs'
      title={id ? __(`Edit Log`, 'gamify') + " " + id : __("Manual Trigger", 'gamify')}
      isOpen={isModalOpen}
      isEnabledFooter={true}
      onRequestClose={() => setIsModalOpen(false)}
      cancelButtonLabel={__("Cancel", 'gamify')}
      submitButtonLabel={!id ? __("Create Log", 'gamify') : __("Update Log", 'gamify')}
      formik={{
        enableReinitialize: true,
        initialValues: getLogsInitailaValues(formData),
        onSubmit: onSubmitHandler
      }}
      size='small'
    >
      <FormInner />
    </ReactModalFormik>
  );
};

export default LogsModal;