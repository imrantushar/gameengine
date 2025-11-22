import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';

const DeductsReferrals = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for referrals"
            desc="The user loses points for signup or visitor referrals.."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        />
    );
}

export default DeductsReferrals;