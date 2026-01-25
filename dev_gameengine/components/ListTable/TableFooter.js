import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@chakra-ui/react';
import Pagination from '@GFComponents/Pagination';
import Select from 'react-select';

const options = [
	{ value: '10', label: __('10', 'gameengine') },
	{ value: '15', label: __('15', 'gameengine') },
	{ value: '20', label: __('20', 'gameengine') },
	{ value: '25', label: __('25', 'gameengine') },
	{ value: '30', label: __('30', 'gameengine') },
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
		const selector = document.getElementById('gameengine-table-row-per-page-selector');
		if (!selector) return;
		selector.childNodes.forEach(function (element) {
			if (element.className.includes('gameengine-select__control')) {
				return element.id = 'gameengine-table-row-per-page-selector-control';
			}
			return element;
		})
		const selectorControl = document.getElementById('gameengine-table-row-per-page-selector-control');
		if (!selectorControl) return;
		selectorControl.childNodes.forEach(function (element) {
			if (element.className.includes('gameengine-select__indicators')) {
				return element.id = 'gameengine-table-row-per-page-selector-indicators';
			}
			return element;
		})
		const selectorIndicators = document.getElementById('gameengine-table-row-per-page-selector-indicators');
		if (!selectorIndicators) return;
		selectorIndicators.removeChild(selectorIndicators.childNodes[0]);
		selectorIndicators.childNodes[0].style.padding = '0 8px 0 0';
		selectorControl.childNodes[0].style.padding = '2px 0px 0px 8px';
	}, [])

	return (
		<div className="gameengine-table__footer">
			<p className="gameengine-table__footer-label">
				{ /* eslint-disable-next-line */}
				{sprintf(
					// translators: %s: totalItems
					__('Showing result %s out of %s', 'gameengine'),
					data?.length,
					totalItems
				)}
			</p>

			<div className="gameengine-table__footer-right">
				<div className="gameengine-table__footer-pagination-per-page">
					<p className="gameengine-table__footer-label">
						{__('Rows per page', 'gameengine')}
					</p>

					<Select
						id='gameengine-table-row-per-page-selector'
						menuPlacement='top'
						className='gameengine-select gameengine-select--65'
						classNamePrefix='gameengine-select'
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
					/>
				</div>

				<div className="gameengine-table__footer-pagination-pages icons">
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
