import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
// import { sortableContainer, sortableElement } from 'react-sortable-hoc';
// import { arrayMoveImmutable } from 'array-move';
// import ReactModal from '@Components/Modal/ReactModal';

// const SortableColumnItem = sortableElement(
// 	( { copyColumn, itemIndex, checkedChange } ) => {
// 		return (
// 			<div
// 				className="gameengine-table__filter-checked-item"
// 				key={ `column-${ itemIndex }` }
// 			>
// 				<span className="gameengine-table-filter-item-left">
// 					<span className="gameengine-icon gameengine-icon--move" />
// 					<span className="gameengine-table-filter-item-title">
// 						{ copyColumn.name }
// 					</span>
// 				</span>
// 				<input
// 					id={ copyColumn.name }
// 					type="checkbox"
// 					checked={ copyColumn.visible }
// 					onChange={ ( event ) =>
// 						checkedChange( {
// 							id: copyColumn.id,
// 							visible: event.target.checked,
// 						} )
// 					}
// 				/>
// 			</div>
// 		);
// 	}
// );

// const SortableColumnItemContainer = sortableContainer( ( props ) => {
// 	return (
// 		<ul className="gameengine-table__filter-items">{ props.children }</ul>
// 	);
// } );

const SortableColumns = ({
	setTempCopyColumns,
	tempCopyColumns,
	showColumnFilter,
	checkedChange,
	setCopyColumns,
	copyColumns,
	suffix
}) => {
	const [modalOpen, isModalOpen] = useState(false);
	const [defaultColumns, setDefaultColumns] = useState([]);
	useEffect(() => {
		setDefaultColumns([...tempCopyColumns]);
	}, []);
	const onRequestClose = () => {
		isModalOpen(false);
	};

	// const onSortEnd = ( { oldIndex, newIndex } ) => {
	// 	const sortedColumn = arrayMoveImmutable(
	// 		tempCopyColumns,
	// 		oldIndex,
	// 		newIndex
	// 	);
	// 	setTempCopyColumns( sortedColumn );
	// };

	const handleToggle = () => {
		isModalOpen(!modalOpen);
	};
	const handleReset = () => {
		setTempCopyColumns([...defaultColumns]);
	};
	return <React.Fragment>
		<div className="gameengine-table__sub-header-filter-icon">
			<button className="bg-transparent text-[var(--gameengine-font-color)] [border-color:var(--gameengine-border-color)] border" onClick={handleToggle}>
				<span className="gameengine-icon gameengine-icon--columns" />
				{__('Columns', 'gameengine')}
			</button>
		</div>

		{/* <ReactModal
    isOpen={ modalOpen }
    onRequestClose={ onRequestClose }
    title={ __( 'Columns', 'gameengine' ) }
    suffix="email"
    size="medium"
    >
    <Box
    	minWidth="520px"
    	p="16px"
    	className="gameengine-table__filter-modal"
    >
    	<Flex
    		justifyContent="space-between"
    		alignItems="center"
    		gap="2"
    	>
    		<Text
    			color="var(--gameengine-font-color)"
    			fontSize="sm"
    			fontWeight="medium"
    		>
    			{ __( 'Columns', 'gameengine' ) }
    		</Text>
    			<Button
    			onClick={ handleReset }
    			bg="transparent"
    			padding="0"
    			height="auto"
    			color="var(--gameengine-font-color)"
    		>
    			{ __( 'Reset', 'gameengine' ) }
    		</Button>
    	</Flex>
    		{ showColumnFilter && (
    		<SortableColumnItemContainer onSortEnd={ onSortEnd }>
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
    			color="var(--gameengine-font-color)"
    			borderColor="var(--gameengine-border-color)"
    			borderWidth="1px"
    			bg="transparent"
    			_hover={ {
    				bg: 'var(--gameengine-secondary-color)',
    			} }
    			onClick={ () => {
    				setTempCopyColumns( [ ...copyColumns ] );
    				isModalOpen( false );
    			} }
    			type="button"
    		>
    			{ __( 'Cancel', 'gameengine' ) }
    		</Button>
    			<Button
    			bg="var(--gameengine-primary)"
    			onClick={ () => {
    				setCopyColumns( tempCopyColumns );
    				localStorage.setItem(
    					suffix,
    					JSON.stringify( tempCopyColumns )
    				);
    				isModalOpen( false );
    			} }
    		>
    			{ __( 'Apply', 'gameengine' ) }
    		</Button>
    	</Flex>
    </Box>
    </ReactModal> */}
	</React.Fragment>;
};

export default SortableColumns;
