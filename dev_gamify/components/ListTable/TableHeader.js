import React from 'react';

const TableHeader = ( {
	visibleColumn,
	isCheckboxColumnVisible,
	copyDataArr,
	selectAllRow,
	data,
} ) => {
	const isCheckboxChecked = data.length > 0 && copyDataArr;

	return (
		<div className="gamify-table__head">
			{ isCheckboxColumnVisible && (
				<div className="gamify-table__head-cell-checkbox">
					<input
						checked={
							isCheckboxChecked &&
							copyDataArr?.every( ( row ) => row.select )
						}
						type="checkbox"
						onChange={ selectAllRow }
					/>
				</div>
			) }

			{ visibleColumn?.map( ( column, index ) => (
				<div
					className={ `gamify-table__head-cell ${
						column.isWidth ?? 'gamify-table__head-cell-width'
					}` }
					key={ index }
				>
					{ column.name }
				</div>
			) ) }
		</div>
	);
};

export default TableHeader;
