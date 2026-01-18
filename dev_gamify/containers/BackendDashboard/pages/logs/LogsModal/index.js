import React from 'react';
import { __ } from '@wordpress/i18n';
import WPModal from '@GFComponents/Modal/WPModal';
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Flex, Input, Textarea, } from '@chakra-ui/react';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';

const LogsModal = ({formData, isModalOpen, setIsModalOpen}) => {
  const id = formData?.id ?? null ;

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

  const userOptions = [
      { value: 1, label: "User 1" },
      { value: 2, label: "User 2" },
      { value: 3, label: "User 3" },
  ];
  return (
    <WPModal
      title={id ? `Edit Log #${formData?.log_id}` : "Manual Trigger"}
      isOpen={isModalOpen}
      onRequestClose={() => setIsModalOpen(false)}
      size="medium"
      suffix='manual-trigger'
    >
      <Flex gap={4}>
          <GamifyInput label={__("User ID", "gamify")}>
              <Select
                classNamePrefix='gamify-select'
                className='gamify-select'
                placeholder="e.g. 1"
                options={userOptions}
                value={userOptions.find(opt => opt.value === formData?.user_id)}
                // onChange={(selected) =>
                //     setFormData({
                //         ...formData,
                //         user_id: selected ? selected.value : ""
                //     })
                // }
                isDisabled={id}
                styles={{
                    container: (base) => ({
                        ...base,
                        width: "100%",
                        opacity: id ? 0.6 : 1,
                    }),
                }}
              />
          </GamifyInput>

          <GamifyInput label={__("Action Type", "gamify")}>
              <Select
                  classNamePrefix='gamify-select'
                  className='gamify-select'
                  defaultValue={formData?.type ?? formData?.type?.items?.label}
                  // onChange={(val) => setFormData({ ...formData, type: val?.value })}
                  options={[
                      { label: 'Award Points (+)', value: 'award' },
                      { label: 'Deduct Points (-)', value: 'deduct' },
                  ]}
              />
          </GamifyInput>
      </Flex>

      <Flex gap={4}>
          <GamifyInput label={__("Points Amount", "gamify")}>
              <Input
                  placeholder={__("Exp: 50", "gamify")}
                  type="number"
                  value={formData?.points}
                  // onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  {...commonInput}
              />
          </GamifyInput>

          {!id && (
              <GamifyInput label={__("Schedule(Optional)", "gamify")}>
                  <Input
                      placeholder={__("Exp: 50", "gamify")}
                      type="datetime-local"
                      value={formData?.schedule_date}
                      // onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                      {...commonInput}
                  />
              </GamifyInput>
          )}
      </Flex>

      <GamifyInput label={__("Description(Optional)", "gamify")}>
          <Textarea
              placeholder={__("Reason for adjustment...", "gamify")}
              size="md"
              minH="100px"
              value={formData?.description}
              // onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
      </GamifyInput>

      <Flex gap={3} justifyContent='flex-end' pt="20px" borderTop="1px solid var(--gamify-border-color)">
          <Button variant="ghost" border="1px solid var(--gamify-border-color)" 
            // onClick={() => setIsModalOpen(false)}
          >
              {__('Cancel', 'gamify')}
          </Button>
          <Button
              {...primaryBtn}
              // onClick={handleSubmit}
              // isLoading={isSubmitting}
              border="1px solid var(--gamify-primary)"
          >
              {id ? __('Update Log', 'gamify') : __('Process Trigger', 'gamify')}
          </Button>
      </Flex>
    </WPModal>
  );
};

export default LogsModal;