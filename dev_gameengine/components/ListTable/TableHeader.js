import React from 'react';

const TableHeader = ({
	visibleColumn,
	isCheckboxColumnVisible,
	copyDataArr,
	selectAllRow,
	data,
}) => {
	const isCheckboxChecked =
		data?.length > 0 &&
		copyDataArr?.length > 0 &&
		copyDataArr?.every((row) => row.select);

	return (
		<thead className="bg-[var(--gameengine-secondary-color)]">
			<tr>
				{isCheckboxColumnVisible && (
					<th className="w-10 px-3 py-3 text-center">
						<input
							type="checkbox"
							aria-label="Select all rows"
							checked={isCheckboxChecked}
							onChange={(e) => selectAllRow({ checked: e.target.checked })}
							className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-current"
						/>
					</th>
				)}

				{visibleColumn?.map((column, index) => {
					const alignClass =
						column?.textAlign 
							? `text-${column.textAlign}`
							: index === 0
							? 'text-left'
							: 'text-center';

					return (
						<th
							key={index}
							style={{
								minWidth: column?.columnWidth ?? 'auto',
								maxWidth: column?.columnWidth ?? 'auto',
								width: column?.columnWidth ?? 'auto',
							}}
							className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap border-b border-[var(--gameengine-border-color)] ${alignClass}`}
						>
							{column?.name}
						</th>
					);
				})}
			</tr>
		</thead>
	);
};

export default TableHeader;
