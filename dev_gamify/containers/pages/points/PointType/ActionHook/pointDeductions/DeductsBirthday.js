import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const DeductsBirthday = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for birthday"
            desc="The user loses points on their birthday."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        />
    );
}

export default DeductsBirthday;