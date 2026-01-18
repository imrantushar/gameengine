import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
// import { getAddonActiveStatus } from '@GFUtils/helper';
import { useSelector } from 'react-redux';
import HelpModal from './HelpModal';
// import './styles.scss';
import { docLists } from './DocListsArray';
import { Button } from '@chakra-ui/react';
import { FaQuestion } from 'react-icons/fa6';

const GetHelp = ({ filterText }) => {
	const allAddons = useSelector((state) => state.addons);
	const [openModal, setOpenModal] = useState(false);
	const [searchText, setSearchText] = useState('');

	const relatedData = docLists.filter((item) => {
		const titleIncludesFilterText = filterText.some((keyword) =>
			item.title.toLowerCase().includes(keyword.toLowerCase())
		);

		const tagsIncludeFilterText = filterText.some((keyword) =>
			item.tags.toLowerCase().includes(keyword.toLowerCase())
		);

		return titleIncludesFilterText || tagsIncludeFilterText;
	});

	const commonData = docLists.filter((item) => {
		const hasTitleMatch = filterText.some((keyword) =>
			item.title.toLowerCase().includes(keyword.toLowerCase())
		);
		const hasTagMatch = filterText.some((keyword) =>
			item.tags.toLowerCase().includes(keyword.toLowerCase())
		);

		return !hasTitleMatch || !hasTagMatch;
	});

	const searchedData = docLists.filter((item) => {
		if (
			item.title.toLowerCase().includes(searchText.toLowerCase()) ||
			item.tags.includes(searchText.toLowerCase())
		) {
			return item;
		}
		return false;
	});

	return (
		<>
			{/* {!getAddonActiveStatus(allAddons, 'white-label', true) && ( */}
				<>
					<Button
						className="gamify-get-help-text"
            position={'fixed'}
            top={'85vh'}
            right={'30px'}
            // width={'220px'}
            height={'40px'}
            overflow={'hidden'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            zIndex={'9'}
            background={'var(--gamify-primary)'}
            padding={'0'}
            borderRadius={'40px'}
						onClick={() => setOpenModal(true)}
						// icon={
						// 	<span className="gamify-icon gamify-icon--questions" />
						// }
					>
            <>
                <FaQuestion />
								{/* {' '}
								<b>{__('Got Stuck!', 'gamify')}</b>{' '}
								<span>
									{__('Find instant answer', 'gamify')}
								</span> */}
							</>
          </Button>
					<div className="gamify-ripple-effect">
						<div className="gamify-ripple-effect-container">
							<div className="gamify-ripple-effect-rain">
								<div className="gamify-ripple-effect-waves">
									<div></div>
									<div></div>
								</div>
							</div>
						</div>
					</div>
				</>
			{/* )} */}
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