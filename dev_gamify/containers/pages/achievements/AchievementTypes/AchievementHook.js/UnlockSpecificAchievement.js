
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const UnlockSpecificAchievement = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Unlock a specific achievement "
            desc="Award points for publishing content.."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default UnlockSpecificAchievement;