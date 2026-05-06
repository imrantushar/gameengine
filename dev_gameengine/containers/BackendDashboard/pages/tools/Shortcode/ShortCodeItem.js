import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { FaRegCopy } from 'react-icons/fa6';
import { AiOutlineQuestion } from 'react-icons/ai';

const ShortCodeItem = ({ shortCodeItem }) => {
  const { title, subtitle, shortCode, description, url, isPro } =
    shortCodeItem;

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
        <GFLabel type="title" margin={0} label={title} isPro={isPro} />
        <GFLabel type="subtitle" margin={0} label={subtitle} />
      </div>

      <div className="gameengine-short-code-item__body flex flex-col w-full">
        <div className="gameengine-short-code-details flex items-center gap-5">
          <div className="gameengine-short-code-text flex w-full items-center">
            <input
              className="gameengine-short-code-text__shortcode gameengine-input ![border:1px_solid_var(--gameengine-border-color)_]"
              style={{
                borderRight: 'none !important',
                outline: 'none',
                boxShadow: 'none !important',
                cursor: isPro ? 'not-allowed' : 'text',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              type="text"
              ref={shortCodeRef}
              name={shortCode}
              value={shortCode}
              readOnly
              disabled={isPro}
            />

            <button
              className="gameengine-btn--copy rounded h-[36px] [border:1px_solid_var(--gameengine-border-color)]"
              style={{
                cursor: isPro ? 'not-allowed' : 'pointer',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onClick={copyToClipboard}
              disabled={isPro}
            >
              <FaRegCopy />
            </button>
          </div>

          <button
            className="gameengine-btn--link rounded-full w-10 h-[36px] [border:1px_solid_var(--gameengine-border-color)]"
            style={{
              cursor: isPro ? 'not-allowed' : 'pointer',
            }}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            disabled={isPro}
          >
            <AiOutlineQuestion />
          </button>
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
