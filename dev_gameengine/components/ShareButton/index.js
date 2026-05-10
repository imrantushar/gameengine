import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiShare2, FiCheck, FiCopy } from 'react-icons/fi';

const ShareButton = ({
    title = '',
    text = '',
    url = '',
    label = '',
    size = 14,
}) => {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
            } catch (e) {
                // user cancelled or error — ignore
            }
            return;
        }

        // Clipboard fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
        } else {
            const el = document.createElement('textarea');
            el.value = shareUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleShare}
            title={copied ? __('Link copied!', 'gameengine') : __('Share', 'gameengine')}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: copied ? '#38a169' : 'inherit',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '13px',
                transition: 'color 0.15s',
            }}
        >
            {copied ? <FiCheck size={size} /> : <FiShare2 size={size} />}
            {label && <span>{copied ? __('Copied!', 'gameengine') : label}</span>}
        </button>
    );
};

export default ShareButton;
