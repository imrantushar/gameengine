import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { FaRegCopy } from 'react-icons/fa6';
import { AiOutlineQuestion } from 'react-icons/ai';

const ShortCodeItem = ({ shortCodeItem }) => {
  const {
    title,
    subtitle,
    shortCode,
    description,
    url,
    attributes = [],
    example,
    requires,
  } = shortCodeItem;
  const shortCodeRef = useRef(null);
  const dispatch = useDispatch();

  const copyToClipboard = (e) => {
    shortCodeRef.current.select();
    document.execCommand('copy');
    e.target.focus();

    dispatch(
      showNotification({
        message: __('Copied', 'gameengine'),
        isShow: true,
        type: 'success',
      })
    );
  };

  return (
    <div className="gameengine-short-code-item flex justify-between items-start pb-6">
      <div className="gameengine-short-code-item__info w-full">
        <p className='text-sm leading-5 font-semibold m-0 text-[var(--gameengine-font-color)]'>{title}</p>

        <p className='text-xs font-normal leading-4 m-0 mt-1 text-[var(--gameengine-warn-muted)]'>{subtitle}</p>
      </div>

      <div className="gameengine-short-code-item__body flex flex-col w-full">
        <div className="gameengine-short-code-details flex items-center gap-5">
          <div className="gameengine-short-code-text flex w-full items-center">
            <input
              className="gameengine-short-code-text__shortcode gameengine-input"
              type="text"
              ref={shortCodeRef}
              name={shortCode}
              value={shortCode}
              readOnly
            />

            <button
              className="gameengine-btn--copy rounded w-[40px] h-[40px] p-0 border border-solid border-l-0 border-[var(--gameengine-border-color)] rounded-tl-none rounded-bl-none"
              onClick={copyToClipboard}
            >
              <FaRegCopy />
            </button>
          </div>

          <a
            className="gameengine-btn--link rounded-full w-10 h-[36px] [border:1px_solid_var(--gameengine-border-color)] flex items-center justify-center"
            href={url || 'https://gameengine.pro/docs/shortcodes/'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AiOutlineQuestion />
          </a>
        </div>

        <div className="gameengine-short-code-description flex pt-1">
          {/* break-words, not break-all: prose should wrap at spaces. */}
          <div className="flex break-words">
            <p
              className="font-normal text-xs m-0 italic"
              style={{ lineHeight: '22px', color: 'var(--gameengine-warn-muted)' }}
            >
              {description}
            </p>
          </div>
        </div>

        {requires && (
          <p className="text-xs m-0 mt-1 text-[var(--gameengine-warn-muted)]">
            <strong>{__('Requires:', 'gameengine')}</strong> {requires}
          </p>
        )}

        {attributes.length > 0 && (
          <div className="gameengine-short-code-attrs mt-3">
            <p className="text-xs font-semibold m-0 mb-1 text-[var(--gameengine-font-color)]">
              {__('Attributes', 'gameengine')}
            </p>

            <div className="flex flex-col gap-1">
              {attributes.map((attr) => (
                <div key={attr.name} className="flex gap-2 items-baseline text-xs leading-5">
                  <code
                    className="shrink-0"
                    style={{
                      color: 'var(--gameengine-primary)',
                      background: 'var(--gameengine-primary-light)',
                      padding: '1px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    {attr.name}
                  </code>

                  <span className="shrink-0 text-[var(--gameengine-placeholder)]">
                    {attr.default === '' ? __('required', 'gameengine') : attr.default}
                  </span>

                  <span className="text-[var(--gameengine-warn-muted)]">{attr.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {example && (
          <div className="gameengine-short-code-example mt-2">
            <p className="text-xs font-semibold m-0 mb-1 text-[var(--gameengine-font-color)]">
              {__('Example', 'gameengine')}
            </p>
            <code
              className="block text-xs"
              style={{
                background: 'var(--gameengine-secondary-color)',
                border: '1px solid var(--gameengine-border-color)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--gameengine-font-color)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {example}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortCodeItem;
