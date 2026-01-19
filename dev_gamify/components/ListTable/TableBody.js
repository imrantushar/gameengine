import React from 'react';
import { __ } from '@wordpress/i18n';
import {
	Table,
	Checkbox,
	Box,
	Flex,
} from '@chakra-ui/react';

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
	hoverAction,
}) => {
	const isLoading = dataFetchingStatus || !copyDataArr;
	console.log({copyDataArr,visibleColumn, isLoading})

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

	if (copyDataArr.length === 0) {
		return (
			<Box ref={bodyRef}>
				<CustomTableMessage
					title={__('No Data Available!!!', 'gamify')}
					subText={noDataText}
					button={button}
				/>
			</Box>
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
							_hover={
								hoverAction
									? { bg: 'gray.50' }
									: undefined
							}
						>
							{isCheckboxColumnVisible && (
								<Table.Cell width="40px">
									<Checkbox
										isChecked={row.select}
										onChange={(e) =>
											selectRowChange({
												row,
												select: e.target.checked,
											})
										}
									/>
								</Table.Cell>
							)}

							{visibleColumn.map(
								(column, columnIndex) => (
									<Table.Cell
										key={columnIndex}
										position="relative"
										width={
											column?.isWidth ??
											'auto'
										}
									>
										{column?.cell(
											row,
											rowIndex
										)}

										{columnIndex === 0 &&
											hoverAction &&
											typeof hoverAction.cell ===
												'function' && (
												<Box
													position="absolute"
													right="8px"
													top="50%"
													transform="translateY(-50%)"
													opacity={0}
													_groupHover={{
														opacity: 1,
													}}
												>
													{hoverAction.cell(
														row,
														rowIndex
													)}
												</Box>
											)}
									</Table.Cell>
								)
							)}
						</Table.Row>
					))}
				</Table.Body>
	);
};

export default TableBody;
