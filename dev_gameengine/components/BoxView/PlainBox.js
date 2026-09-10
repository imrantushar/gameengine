import React from 'react';

/**
 * An untitled white panel — same surface as `BoxView`, without the header row.
 */
const PlainBox = ({ children }) => {
    return (
        <div className='gameengine-surface px-6 py-[32px]'>
            {children}
        </div>
    );
};

export default PlainBox;
