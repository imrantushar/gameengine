import React from 'react';
import { __ } from '@wordpress/i18n';
import { createLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import ReactModalFormik from '@GFComponents/Modal/ReactModalFormik';
import { getLogsInitailaValues } from './helper';
import FormInner from './FormInner';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';

const LogsModal = ({formData, isModalOpen, onRequestClose}) => {
  const id = formData?.id ;
  const dispatch = useDispatch();

  const onSubmitHandler = async (values, actions) => {
    if (!values?.user_id && !values?.id) {
      dispatch(showNotification({
          message: __('User ID is required!', 'gameengine'),
          isShow: true,
          type: 'error',
      }))
      actions.setSubmitting(false);
      return;
    }
    
    actions.setSubmitting(true)
    try {
      if (!values.id) {
        await dispatch(createLogAction(values));
      } else {
        await dispatch(updateLogAction(values));
      }
    } catch (error) {
      console.warn({error})
    } finally {
      actions.setSubmitting(false);
      actions.resetForm({});
      onRequestClose();
    }
  };
  
  return (
    <ReactModalFormik
      suffix='logs'
      title={id ? __(`Edit Log`, 'gameengine') + " " + id : __("Manual Trigger", 'gameengine')}
      isOpen={isModalOpen}
      isEnabledFooter={true}
      onRequestClose={onRequestClose}
      cancelButtonLabel={__("Cancel", 'gameengine')}
      submitButtonLabel={!id ? __("Create Log", 'gameengine') : __("Update Log", 'gameengine')}
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