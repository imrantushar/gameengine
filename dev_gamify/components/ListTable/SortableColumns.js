import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import ReactModal from '@GFComponents/Modal/ReactModal';

const DragHandle = sortableHandle( () => (
	<span
		className="gamify-icon gamify-icon--move"
		role="button"
		aria-label="drag-handle"
		style={{ cursor: 'grab', display: 'inline-block', paddingRight: '8px' }}
	/>
) );

const SortableColumnItem = sortableElement(
	( { copyColumn, itemIndex, checkedChange } ) => {
		return (
			<div
				className="gamify-table__filter-checked-item"
				key={ `column-${ itemIndex }` }
			>
				<span className="gamify-table-filter-item-left">
					<DragHandle />
					<span className="gamify-table-filter-item-title">
						{ copyColumn.name }
					</span>
				</span>
				<input
					id={ copyColumn.name }
					type="checkbox"
					checked={ copyColumn.visible }
					onChange={ ( event ) =>
						checkedChange( {
							id: copyColumn.id,
							visible: event.target.checked,
						} )
					}
				/>
			</div>
		);
	}
);
const SortableColumnItemContainer = sortableContainer( ( props ) => {
	return (
		<ul className="gamify-table__filter-items">{ props.children }</ul>
	);
} );

const SortableColumns = ( {
	setTempCopyColumns,
	tempCopyColumns,
	showColumnFilter,
	checkedChange,
	setCopyColumns,
	copyColumns,
	suffix,
} ) => {
	const [ modalOpen, isModalOpen ] = useState( false );
	const [ defaultColumns, setDefaultColumns ] = useState( [] );

	useEffect( () => {
		setDefaultColumns( [ ...tempCopyColumns ] );
	}, [] );

	const onRequestClose = () => {
		isModalOpen( false );
	};

	const onSortEnd = ( { oldIndex, newIndex } ) => {
		const sortedColumn = arrayMoveImmutable(
			tempCopyColumns,
			oldIndex,
			newIndex
		);
		setTempCopyColumns( sortedColumn );
	};

	const handleToggle = () => {
		isModalOpen( ! modalOpen );
	};

	const handleReset = () => {
		setTempCopyColumns( [ ...defaultColumns ] );
	};

	return (
		<React.Fragment>
			<div className="gamify-table__sub-header-filter-icon">
				<Button
					color="var(--gamify-font-color)"
					borderColor="var(--gamify-border-color)"
					borderWidth="1px"
					bg="transparent"
					onClick={ handleToggle }
					_hover={ {
						bg: 'var(--gamify-body-background)',
					} }
				>
					<span className="gamify-icon gamify-icon--columns" />
					{ __( 'Columns', 'gamify' ) }
				</Button>
			</div>

			<ReactModal
				isOpen={ modalOpen }
				onRequestClose={ onRequestClose }
				title={ __( 'Columns', 'gamify' ) }
				suffix="email"
				size="medium"
			>
				<Box
					minWidth="520px"
					p="16px"
					className="gamify-table__filter-modal"
				>
					<Flex
						justifyContent="space-between"
						alignItems="center"
						gap="2"
					>
						<Text
							color="var(--gamify-font-color)"
							fontSize="sm"
							fontWeight="medium"
						>
							{ __( 'Columns', 'gamify' ) }
						</Text>

						<Button
							onClick={ handleReset }
							bg="transparent"
							padding="0"
							height="auto"
							color="var(--gamify-font-color)"
						>
							{ __( 'Reset', 'gamify' ) }
						</Button>
					</Flex>

					{ showColumnFilter && (
						<SortableColumnItemContainer onSortEnd={ onSortEnd } useDragHandle helperClass="sortable-helper">
							{ tempCopyColumns?.map( ( item, index ) => (
								<SortableColumnItem
									key={ `column-${ index }` }
									index={ index }
									copyColumn={ item }
									itemIndex={ index }
									checkedChange={ checkedChange }
								/>
							) ) }
						</SortableColumnItemContainer>
					) }

					<Flex justifyContent="flex-end" gap="2">
						<Button
							color="var(--gamify-font-color)"
							borderColor="var(--gamify-border-color)"
							borderWidth="1px"
							bg="transparent"
							_hover={ {
								bg: 'var(--gamify-body-background)',
							} }
							onClick={ () => {
								setTempCopyColumns( [ ...copyColumns ] );
								isModalOpen( false );
							} }
							type="button"
						>
							{ __( 'Cancel', 'gamify' ) }
						</Button>

						<Button
							bg="var(--gamify-primary)"
							onClick={ () => {
								setCopyColumns( tempCopyColumns );
								localStorage.setItem(
									suffix,
									JSON.stringify( tempCopyColumns )
								);
								isModalOpen( false );
							} }
						>
							{ __( 'Apply', 'gamify' ) }
						</Button>
					</Flex>
				</Box>
			</ReactModal>
		</React.Fragment>
	);
};

export default SortableColumns;
