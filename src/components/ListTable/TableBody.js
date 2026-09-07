import React from 'react';

const TableBody = ({
	copyDataArr,
	visibleColumn,
	isCheckboxColumnVisible,
	selectRowChange,
	bodyRef,
}) => {
	return (
		<tbody ref={bodyRef}>
			{copyDataArr.length > 0 &&
				copyDataArr.map((row, rowIndex) => (
					<tr
						key={rowIndex}
						role="group"
						className="border-solid border-t-0 border-l-0 border-r-0 border-b border-[var(--gameengine-border-color)] hover:bg-gray-50 transition-colors duration-150"
					>
						{isCheckboxColumnVisible && (
							<td className="w-10 px-3 py-3 text-center">
								<input
									type="checkbox"
									aria-label="Select row"
									checked={row.select}
									onChange={(e) =>
										selectRowChange({
											row,
											select: e.target.checked,
										})
									}
									className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-current"
								/>
							</td>
						)}

						{visibleColumn.map((column, columnIndex) => {
							const alignClass =
								column?.textAlign
									? `text-${column.textAlign}`
									: columnIndex === 0
										? 'text-left'
										: 'text-center';

							return (
								<td
									key={columnIndex}
									style={{ width: column?.width }}
									className={`px-4 py-3 text-sm relative ${alignClass}`}
								>
									{column?.cell(row, rowIndex)}
								</td>
							);
						})}
					</tr>
				))}
		</tbody>
	);
};

export default TableBody;
