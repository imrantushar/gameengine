import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

const Drawer = ({ isOpen = false, onClose, title = '', width = '420px', children }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    const content = (
        <>
            {/* Backdrop */}
            <div
                className={[
                    'fixed inset-0 bg-black/50 z-[100000]',
                    'transition-opacity duration-300 ease-in-out',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={[
                    'fixed top-0 right-0 h-full bg-white z-[100001]',
                    'flex flex-col',
                    'shadow-2xl',
                    'transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none',
                ].join(' ')}
                style={{ width }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-0 border-b border-solid border-[var(--gameengine-border-color)] shrink-0">
                    <h2 className="text-base font-semibold m-0 text-[#1a1a2e]">{title}</h2>
                    <button
                        type="button"
                        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors bg-transparent border-0 cursor-pointer"
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </>
    );

    return createPortal(content, document.body);
};

export default Drawer;
