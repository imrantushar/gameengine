import React from 'react';
import { __ } from '@wordpress/i18n';
import { Table, Checkbox, Box, Flex } from '@chakra-ui/react';
import Preloader from '@GFComponents/Loader/Preloader';
import CustomTableMessage from '@GFComponents/Oops/CustomTableMessage';

const TableBody = ({
	dataFetchingStatus,
	copyDataArr,
	visibleColumn,
	isCheckboxColumnVisible,
	selectRowChange,
	noDataText,
	loadingHeight,
	bodyRef,
	button,
}) => {
	const isLoading = dataFetchingStatus || !copyDataArr;

	if (isLoading) {
		return (
			<Flex
				minH={loadingHeight}
				align="center"
				justify="center"
				ref={bodyRef}
			>
				<Preloader />
			</Flex>
		);
	}

	if (visibleColumn.length === 0) {
		return (
			<Box ref={bodyRef}>
				<CustomTableMessage
					title={__('No visible columns available!!', 'gamify')}
				/>
			</Box>
		);
	}

	return (
		<Table.Body ref={bodyRef}>
			{copyDataArr.length > 0 && copyDataArr.map((row, rowIndex) => (
				<Table.Row
					key={rowIndex}
					role="group"
					borderBottomWidth="1px" borderColor="var(--gamify-border-color)"
				>
					{isCheckboxColumnVisible && (
						<Table.Cell width="40px">
							<Checkbox.Root
								size="sm"
								mt="0.5"
								aria-label="Select row"
								checked={row.select}
								onCheckedChange={(changes) =>
									selectRowChange({
										row,
										select: changes.checked,
									})
								}
							>
								<Checkbox.HiddenInput />
								<Checkbox.Control />
							</Checkbox.Root>
						</Table.Cell>
					)}

					{visibleColumn.map(
						(column, columnIndex) => (
							<Table.Cell
								key={columnIndex}
								position="relative"
								textAlign={column?.textAlign ? column?.textAlign : "center"}
							>
								{column?.cell(row, rowIndex)}
							</Table.Cell>
						)
					)}
				</Table.Row>
			))}
		</Table.Body>
	);
};

export default TableBody;
