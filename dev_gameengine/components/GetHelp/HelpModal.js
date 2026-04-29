import React from 'react';
import { __ } from '@wordpress/i18n';
import WPModal from '@GFComponents/Modal/WPModal';
// import Button from '@Components/Button';
import Search from '@GFComponents/Search';
import DocList from './DocsList';
const HelpModal = ({
  isOpen,
  closeModal,
  searchText,
  setSearchText,
  relatedData,
  commonData,
  searchedData
}) => <WPModal isOpen={isOpen} title={__('Help', 'academy')} suffix="help" onRequestClose={closeModal} contentLabel={__('Need Help?', 'academy')} shouldCloseOnClickOutside={true}>
		<button
  // icon={<span className="academy-icon academy-icon--angle-left" />}
  onClick={closeModal} suffix="close-modal" />

		<Search placeholder={__('Search Docs', 'academy')} onSearchHandler={value => setSearchText(value.trim())} value={searchText} searchText={searchText} setSearchText={setSearchText} />

		{searchText.length === 0 ? <>
				<DocList title={__('Related Docs', 'academy')} data={relatedData} notDocsFound={__('No Related docs available', 'academy')} />

				<DocList title={__('Common Docs', 'academy')} data={commonData} notDocsFound={__('No Related docs available', 'academy')} />
			</> : <DocList title={__('Search Results', 'academy')} data={searchedData} notDocsFound={__('No results found!', 'academy')} />}
	</WPModal>;
export default HelpModal;