import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const DeductsPublishingContent = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <CustomCollapsible
      label="Deducts for publishing content"
      desc="The user loses points for publishing content."
      isOpen={isOpen}
      onClick={() => setIsOpen(!isOpen)}
       singleIcon={true}
    />
  );
}

export default DeductsPublishingContent;