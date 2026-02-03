import React, { useState, useEffect } from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import WPModal from './WPModal';

const TrashModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalSelected = 0,
}) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isOpen) setStep(1);
  }, [isOpen]);

  const StepOne = () => (
    <Flex gap={4} alignItems="center">
      <Button
        variant="ghost"
        onClick={onClose}
      >
        {__('Close', 'gameengine')}
      </Button>

      <Text fontSize="16px" fontWeight="bold">
        {totalSelected} {__('Items selected', 'gameengine')}
      </Text>

      <Button background="red" onClick={() => setStep(2)}>
        {__('Move to Trash', 'gameengine')}
      </Button>
    </Flex>
  );

  const StepTwo = () => (
    <Flex gap={4}>
      <Text fontSize="14px">
        {__('Are you sure you want to move these items to trash?', 'gameengine')}
      </Text>

      <Flex justifyContent="flex-end" gap={2}>
        <Button variant="outline" onClick={onClose}>
          {__('Cancel', 'gameengine')}
        </Button>
        <Button background="red" onClick={onConfirm}>
          {__('Continue', 'gameengine')}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <WPModal
      isOpen={isOpen}
      // title={__('Trash Confirmation', 'gameengine')}
      onRequestClose={onClose}
      size="small"
    >
      {step === 1 ? <StepOne /> : <StepTwo />}
    </WPModal>
  );
};

export default TrashModal;
