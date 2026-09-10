import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { FaLock, FaRegCopy } from 'react-icons/fa6';
import { AiOutlineQuestion } from 'react-icons/ai';

const ShortCodeItem = ({ shortCodeItem }) => {
  const { title, subtitle, shortCode, description, url, isPro } = shortCodeItem;
  const shortCodeRef = useRef(null);
  const dispatch = useDispatch();

  const copyToClipboard = (e) => {
    if (isPro) return;

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
        {isPro ? (
          <div className="flex items-center gap-2">
            <p className='text-sm leading-5 font-semibold m-0 text-[var(--gameengine-font-color)]'>{title}</p>
            <p className="items-center m-0 text-white rounded-sm leading-none uppercase inline-flex bg-[#FFA943] [padding:3px_6px] text-[10px]">{__("PRO", 'gameengine')}</p>
            <FaLock color="orange.400" size="16px" />
          </div>
        ) : (
          <p className='text-sm leading-5 font-semibold m-0 text-[var(--gameengine-font-color)]'>{title}</p>
        )}

        <p className='text-xs font-normal leading-4 m-0 mt-1 text-[#738496]'>{subtitle}</p>
      </div>

      <div className="gameengine-short-code-item__body flex flex-col w-full">
        <div className="gameengine-short-code-details flex items-center gap-5">
          <div className="gameengine-short-code-text flex w-full items-center">
            <input
              className="gameengine-short-code-text__shortcode gameengine-input"
              style={{
                cursor: isPro ? 'not-allowed' : 'text',
              }}
              type="text"
              ref={shortCodeRef}
              name={shortCode}
              value={shortCode}
              readOnly
              disabled={isPro}
            />

            <button
              className="gameengine-btn--copy rounded w-[40px] h-[40px] p-0 border border-solid border-l-0 border-[var(--gameengine-border-color)] rounded-tl-none rounded-bl-none"
              style={{
                cursor: isPro ? 'not-allowed' : 'pointer',
              }}
              onClick={copyToClipboard}
              disabled={isPro}
            >
              <FaRegCopy />
            </button>
          </div>

          <a
            className="gameengine-btn--link rounded-full w-10 h-[36px] [border:1px_solid_var(--gameengine-border-color)] flex items-center justify-center"
            style={{
              cursor: isPro ? 'not-allowed' : 'pointer',
            }}
            href={url || 'https://gameengine.pro/docs/shortcodes/'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AiOutlineQuestion />
          </a>
        </div>

        <div className="gameengine-short-code-description flex pt-1">
          <div className="flex break-all">
            <p
              className="font-normal text-xs m-0 italic"
              style={{
                lineHeight: '22px',
                color: '#707070',
              }}
            >
              {__('You can use: ', 'gameengine') + shortCode} <br />{' '}
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCodeItem;
