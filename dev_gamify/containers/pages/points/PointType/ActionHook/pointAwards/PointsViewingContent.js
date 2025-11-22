import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const PointsViewingContent = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for viewing content"
            desc="The user loses points for viewing content."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
        />
    );
};

export default PointsViewingContent;