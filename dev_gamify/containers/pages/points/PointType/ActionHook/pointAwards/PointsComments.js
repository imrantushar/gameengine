import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const PointsComments = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for comments"
            desc="The user loses points for making comments."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        />
    );
}

export default PointsComments;