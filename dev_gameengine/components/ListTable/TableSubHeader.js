import React from 'react';
import SortableColumns from './SortableColumns';

const TableSubHeader = ({
	subHeaderComponent,
	setTempCopyColumns,
	tempCopyColumns,
	showColumnFilter,
	checkedChange,
	setCopyColumns,
	copyColumns,
	suffix,
}) => {
	return (
		<div className="flex justify-between items-center w-full">
			<div className="flex justify-between items-center w-full">
				{subHeaderComponent && subHeaderComponent}
			</div>

			{showColumnFilter ? (
				<div>
					<SortableColumns
						setTempCopyColumns={setTempCopyColumns}
						tempCopyColumns={tempCopyColumns}
						showColumnFilter={showColumnFilter}
						checkedChange={checkedChange}
						setCopyColumns={setCopyColumns}
						copyColumns={copyColumns}
						suffix={suffix}
					/>
				</div>
			) : null}
		</div>
	);
};

export default TableSubHeader;
