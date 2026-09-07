import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import HelpModal from './HelpModal';
import { docLists } from './DocListsArray';
import { FaQuestion } from 'react-icons/fa6';

import './styles.scss';

const GetHelp = ({ filterText }) => {
  const allAddons = useSelector(state => state.addons);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const relatedData = docLists?.filter(item => {
    const titleIncludesFilterText = filterText?.some(keyword => item?.title?.toLowerCase().includes(keyword.toLowerCase()));
    const tagsIncludeFilterText = filterText?.some(keyword => item?.tags.toLowerCase().includes(keyword.toLowerCase()));
    return titleIncludesFilterText || tagsIncludeFilterText;
  });

  const commonData = docLists?.filter(item => {
    const hasTitleMatch = filterText?.some(keyword => item?.title?.toLowerCase().includes(keyword.toLowerCase()));
    const hasTagMatch = filterText?.some(keyword => item?.tags.toLowerCase().includes(keyword.toLowerCase()));
    return !hasTitleMatch || !hasTagMatch;
  });

  const searchedData = docLists?.filter(item => {
    if (item?.title?.toLowerCase().includes(searchText.toLowerCase()) || item?.tags.includes(searchText.toLowerCase())) {
      return item;
    }
    return false;
  });

  return (
    <>
      <button className="gameengine-get-help-text" onClick={() => setOpenModal(true)}>
        <div className="gameengine-get-help-text__label">
          <p className="m-0">
            <span className="font-medium">{__('Got Stuck! ', 'gameengine')}</span>
            <span>{__('Find instant answer.', 'gameengine')}</span>
          </p>
        </div>

        <div className="gameengine-get-help-text__icon">
          <FaQuestion color="#fff" />
        </div>
      </button>

      <div className="gameengine-ripple-effect">
        <div className="gameengine-ripple-effect-container">
          <div className="gameengine-ripple-effect-rain">
            <div className="gameengine-ripple-effect-waves">
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      <HelpModal
        isOpen={openModal}
        closeModal={() => {
          setOpenModal(false);
          setSearchText('');
        }}
        searchText={searchText}
        setSearchText={setSearchText}
        relatedData={relatedData}
        commonData={commonData}
        searchedData={searchedData}
      />
    </>
  );
};

export default GetHelp;
