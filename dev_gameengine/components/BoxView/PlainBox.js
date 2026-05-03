import React from 'react';

const PlainBox = ({children}) => {
    return (
        <div className='bg-white px-6 py-[32px]'>
            {children}
        </div>
    );
};

export default PlainBox;
