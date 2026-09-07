import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import Pagination from '@GFComponents/Pagination';

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
	const currentValue = rowsPerPage
		? options.find((item) => Number(item.value) === Number(rowsPerPage))?.value
		: options[0].value;

	const handleChange = (e) => {
		paginationPerPageChange({ value: e.target.value });
	};

	return (
		<div className="flex items-center justify-between gap-4 mt-3">
			<p className="text-sm font-normal leading-none m-0">
				{/* eslint-disable-next-line */}
				{sprintf(
					// translators: %1$s: Item showing, %2$s: totalItems
					__('Showing result %1$s out of %2$s', 'gameengine'),
					data?.length,
					totalItems
				)}
			</p>

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-4">
					<p className="text-sm font-normal leading-none m-0">
						{__('Rows per page', 'gameengine')}
					</p>

					<select
						value={currentValue}
						onChange={handleChange}
						className="text-sm border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<div>
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
