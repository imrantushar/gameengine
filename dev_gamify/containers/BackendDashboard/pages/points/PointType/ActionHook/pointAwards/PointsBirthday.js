import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const PointsBirthday = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for birthday"
            desc="The user loses points on their birthday."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default PointsBirthday;