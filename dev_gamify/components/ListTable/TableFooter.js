import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@chakra-ui/react';
import Pagination from '@Components/Pagination';
// import Select from 'react-select';

const options = [
	{ value: '10', label: __('10', 'gamify') },
	{ value: '15', label: __('15', 'gamify') },
	{ value: '20', label: __('20', 'gamify') },
	{ value: '25', label: __('25', 'gamify') },
	{ value: '30', label: __('30', 'gamify') },
];

const TableFooter = ({
	data,
	totalItems,
	paginationPerPageChange,
	rowsPerPage,
	onChangePage,
	currentPageNumber,
}) => {

	React.useEffect(() => {
		const selector = document.getElementById('gamify-table-row-per-page-selector');
		selector.childNodes.forEach(function (element) {
			if (element.className.includes('gamify-select__control')) {
				return element.id = 'gamify-table-row-per-page-selector-control';
			}
			return element;
		})
		const selectorControl = document.getElementById('gamify-table-row-per-page-selector-control');
		selectorControl.childNodes.forEach(function (element) {
			if (element.className.includes('gamify-select__indicators')) {
				return element.id = 'gamify-table-row-per-page-selector-indicators';
			}
			return element;
		})
		const selectorIndicators = document.getElementById('gamify-table-row-per-page-selector-indicators');
		selectorIndicators.removeChild(selectorIndicators.childNodes[0]);
		selectorIndicators.childNodes[0].style.padding = '0 8px 0 0';
		selectorControl.childNodes[0].style.padding = '2px 0px 0px 8px';
	}, [])

	return (
		<div className="gamify-table__footer">
			<Text
				color="var(--gamify-font-color)"
				fontSize="sm"
				fontWeight="normal"
			>
				{ /* eslint-disable-next-line */}
				{sprintf(
					// translators: %s: totalItems
					__('Showing result %s out of %s', 'gamify'),
					data?.length,
					totalItems
				)}
			</Text>

			<div className="gamify-table__footer-right">
				<div className="gamify-table__footer-pagination per__page">
					<Text
						color="var(--gamify-font-color)"
						fontSize="sm"
						fontWeight="normal"
					>
						{__('Rows per page', 'gamify')}
					</Text>

					{/* <Select
						id='gamify-table-row-per-page-selector'
						menuPlacement='top'
						className='gamify-select'
						classNamePrefix='gamify-select'
						options={options}
						value={
							rowsPerPage
								? options.find(
									(item) =>
										Number(item.value) ===
										Number(rowsPerPage)
								)
								: options[0]
						}
						onChange={paginationPerPageChange}
					/> */}

				</div>
				<div className="gamify-table__footer-pagination-pages icons">
					<Pagination
						totalItems={totalItems}
						fetchHandler={onChangePage}
						currentPageNumber={currentPageNumber}
						rowsPerPage={rowsPerPage}
					/>
				</div>
			</div>
		</div>
	);
};

export default TableFooter;
