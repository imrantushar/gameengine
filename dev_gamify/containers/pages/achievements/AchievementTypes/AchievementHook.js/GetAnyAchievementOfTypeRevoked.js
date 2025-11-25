
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const GetAnyAchievementOfTypeRevoked = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Get any achievement of type revoked"
            desc="Award points for logging in.."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default GetAnyAchievementOfTypeRevoked;