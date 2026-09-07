import React from 'react';
import { plugin_root_url } from '@GFUtils/helper';
import { LuInfo } from 'react-icons/lu';
import { __ } from '@wordpress/i18n';

const EmptyState = () => {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 py-10 text-center border border-dashed border-[var(--gameengine-border-color)] rounded">
                <div className='bg-[#E3E7FF] rounded-full w-[50px] h-[50px] flex items-center justify-center'>
                    <img
                        src={`${plugin_root_url}/assets/images/drag_drop.svg`}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold leading-6 text-[var(--gameengine-heading-color)] m-0">
                        {__('No active hooks yet', 'gameengine')}
                    </p>
                    <p className="text-sm text-[#738496] leading-5 m-0">
                        {__('Drag and drop an item from Available Hooks to activate it', 'gameengine')}
                    </p>
                </div>
            </div>

            <div className='flex items-start gap-2 bg-[#F6F7F8] border border-solid border-[var(--gameengine-border-color)] border-l-2 border-l-[var(--gameengine-primary)] rounded mt-6 p-3'>
                <LuInfo fontSize="16px" size="16px" />
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-4 text-[var(--gameengine-heading-color)] m-0">
                        {__('How to active a hook?', 'gameengine')}
                    </p>
                    <p className="text-[10px] text-[#738496] leading-[14px] m-0">
                        {__('Simply drag a hook from the list on the left and drop it here. You can reorder the hooks by dragging them up or down.', 'gameengine')}
                    </p>
                </div>
            </div>
        </>
    );
};

export default EmptyState;