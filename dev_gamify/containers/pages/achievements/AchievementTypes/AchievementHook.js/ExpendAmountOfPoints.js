;
import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const ExpendAmountOfPoints = (props) => {
     const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Expend an amount of points "
            desc="Reward users with points on their birthday."
            isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                 singleIcon={true}
        />
    );
}

export default ExpendAmountOfPoints;