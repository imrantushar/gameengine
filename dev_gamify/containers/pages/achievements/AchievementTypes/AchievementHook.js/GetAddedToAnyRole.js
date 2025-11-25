
;
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const GetAddedToAnyRole = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Get added to any role"
            desc="Award points for making comments."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default GetAddedToAnyRole;