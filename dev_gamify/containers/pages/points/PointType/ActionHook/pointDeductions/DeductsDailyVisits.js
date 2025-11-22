import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const DeductsDailyVisits = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for daily visits"
            desc="The user loses points for visiting your website on a daily basis."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        />
    );
}

export default DeductsDailyVisits;