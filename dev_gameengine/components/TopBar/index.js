import React from 'react';
import { __ } from '@wordpress/i18n';
import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';
import { plugin_root_url } from '@GFUtils/helper';

const TopBar = ({
  rightContent,
  middleContent,
  leftContent,
  path,
  className = "",
  hasBreadCrumb = false,
  items = []
}) => {
  const pathName = path ? path : __("Gameengine", "gemBooking");
  const isExternal = (url) => /^https?:\/\//.test(url);
  const classes = [
    "flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--gameengine-background)] shadow-[var(--gameengine-box-shadow)] sticky top-[32px] p-5 px-6 z-[999] mb-6 gameengine-topbar",
    className && className,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
    >
      {leftContent ? (
        leftContent
      ) : hasBreadCrumb ? (
        <div className="flex items-center gap-2" aria-label="Breadcrumb">
          <div className='flex items-center justify-center bg-[#E3E7FF] rounded-full w-[40px] h-[40px]'>
            <img
              src={`${plugin_root_url}/assets/images/logo.svg`}
              alt="Gameengine Logo"
              className="w-[20px] h-[20px]"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <p className="flex items-center gap-2 m-0" key={index}>
                  {item.href ? (
                    <div className="gameengine-breadcrumb__link text-[var(--gameengine-text-color)] text-sm font-medium hover:text-[var(--gameengine-primary-color)] transition-colors no-underline">
                      {isExternal(item.href) ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='no-underline'
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link to={item.href} className='no-underline'>
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span className="gameengine-breadcrumb__current-link text-[#454F59] text-sm font-medium">
                      {item.label}
                    </span>
                  )}

                  {!isLast && (
                    <span className="text-base mb-[-4px]">
                      <MdPlayArrow />
                    </span>
                  )}
                </p>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className='flex items-center justify-center bg-[#E3E7FF] rounded-full w-[40px] h-[40px]'>
            <img
              src={`${plugin_root_url}/assets/images/logo.svg`}
              alt="Gameengine Logo"
              className="w-[20px] h-[20px]"
            />
          </div>
          <img
            src={`${plugin_root_url}/assets/images/arrow-right.svg`}
            alt="Arrow Right"
            className="w-4"
          />
          <span className="text-[#454F59] text-[14px] font-normal leading-5">{pathName}</span>
        </div>
      )}

      {middleContent ? middleContent : null}

      {rightContent ? rightContent : null}
    </div>
  );
};

export default TopBar;
