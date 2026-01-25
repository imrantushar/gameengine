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
		<div className="gameengine-table__sub-header">
			<div className="gameengine-table__sub-header-left">
				{subHeaderComponent && subHeaderComponent}
			</div>

			{showColumnFilter ? (
				<div className="gameengine-table__sub-header-right">
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
			) : (
				null
			)}
		</div>
	);
};

export default TableSubHeader;
