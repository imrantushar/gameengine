import React from 'react';
import { __ } from '@wordpress/i18n';
import WPModal from '@GFComponents/Modal/WPModal';
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Flex, Input, Textarea, } from '@chakra-ui/react';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';
import { Formik } from 'formik';
import ReactModalFormik from '@GFComponents/Modal/ReactModalFormik';
import { getLogsInitailaValues } from './helper';
import FormInner from './FormInner';

const LogsModal = ({formData, isModalOpen, setIsModalOpen}) => {
  const id = formData?.id ;

    // const handleSubmit = async () => {
    //     if (!formData?.user_id && modalMode === 'create') {
    //         alert(__('User ID is required', 'gamify'));
    //         return;
    //     }

    //     setIsSubmitting(true);
    //     let result;

    //     // Prepare Payload
    //     const payload = {
    //         ...formData,
    //         // Map 'reference' to 'trigger_key' for backend compatibility if needed
    //         trigger_key: formData?.reference
    //     };

    //     if (modalMode === 'edit') {
    //         // Update Action
    //         result = await dispatch(updateLogAction({
    //             id: formData?.log_id,
    //             data: {
    //                 points_awarded: formData?.points,
    //                 type: formData?.type,
    //                 message: formData?.description
    //             }
    //         }));
    //     } else {
    //         // Create Action
    //         result = await dispatch(manualLogAction(payload));
    //     }

    //     setIsSubmitting(false);

    //     if (manualLogAction.fulfilled.match(result) || updateLogAction.fulfilled.match(result)) {
    //         setIsModalOpen(false);
    //     } else {
    //         alert(__('Error: ', 'gamify') + (result.payload || 'Failed'));
    //     }
    // };
  return (
    <ReactModalFormik
      suffix='logs'
      title={id ? `Edit Log #${id}` : "Manual Trigger"}
      isOpen={isModalOpen}
      isEnabledFooter={true}
      onRequestClose={() => setIsModalOpen(false)}
      cancelButtonLabel={__("Cancel", 'gamify')}
      submitButtonLabel={!id ? __("Create Log", 'gamify') : __("Update Log", 'gamify')}
      formik={{
        enableReinitialize: true,
        initialValues: getLogsInitailaValues(formData),
        // onSubmit: onSubmitHandler
      }}
      size='small'
    >
      <FormInner />
    </ReactModalFormik>
  );
};

export default LogsModal;