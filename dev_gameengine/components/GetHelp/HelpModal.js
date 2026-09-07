import React from 'react';
import { __ } from '@wordpress/i18n';
import WPModal from '@GFComponents/Modal/WPModal';
import Search from '@GFComponents/Search';
import DocList from './DocsList';

import './styles.scss';
import { IoClose } from 'react-icons/io5';

const HelpModal = ({
  isOpen,
  closeModal,
  searchText,
  setSearchText,
  relatedData,
  commonData,
  searchedData
}) => {
  return (
    <WPModal isOpen={isOpen} title={__('Help', 'gameengine')} suffix="help" onRequestClose={closeModal} contentLabel={__('Need Help?', 'gameengine')} shouldCloseOnClickOutside={true}>
      <button
        // icon={<span className="academy-icon academy-icon--angle-left" />}
        onClick={closeModal} className="gameengine-btn-close-modal"><IoClose /></button>

      <Search placeholder={__('Search Docs', 'gameengine')} onSearchHandler={value => setSearchText(value.trim())} value={searchText} searchText={searchText} setSearchText={setSearchText} custom='gameengine-help-search' />

      {searchText.length === 0 ? <>
        <DocList title={__('Related Docs', 'gameengine')} data={relatedData} notDocsFound={__('No Related docs available', 'gameengine')} />

        <DocList title={__('Common Docs', 'gameengine')} data={commonData} notDocsFound={__('No Related docs available', 'gameengine')} />
      </> : <DocList title={__('Search Results', 'gameengine')} data={searchedData} notDocsFound={__('No results found!', 'gameengine')} />}
    </WPModal>
  )
};

export default HelpModal;
