
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const ExpendAmountOfPoints = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Get a specific achievement revoked"
            desc="Award points for viewing content.."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default ExpendAmountOfPoints;