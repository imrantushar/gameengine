
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const UnlockAllAchievementOfType = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Unlock all Achievement of type "
            desc="Award points for visiting your website on a daily basis."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default UnlockAllAchievementOfType;