import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { is_admin } from '@GFUtils/helper';
import PropTypes from 'prop-types';
// component
import TableSubHeader from './TableSubHeader';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import _ from 'lodash';
import { Table } from '@chakra-ui/react';

const propTypes = {
	columns: PropTypes.array,
	data: PropTypes.array,
	isRowSelectable: PropTypes.bool,
	getSelectRowValue: PropTypes.func,
	showSubHeader: PropTypes.bool,
	subHeaderComponent: PropTypes.func,
	showColumnFilter: PropTypes.bool,
	showPagination: PropTypes.bool,
	onChangePage: PropTypes.func,
	onChangeItemsPerPage: PropTypes.func,
	suffix: PropTypes.string,
	noDataText: PropTypes.string,
	currentPageNumber: PropTypes.number,
	totalItems: PropTypes.number,
	dataFetchingStatus: PropTypes.bool,
	resetSelected: PropTypes.bool,
	rowsPerPage: PropTypes.number,
	Button: PropTypes.node,
	hoverAction: PropTypes.bool,
};

const ListTable = ( props ) => {
	const {
		columns = [],
		data = [],
		isRowSelectable = true,
		getSelectRowValue,
		showSubHeader = true,
		subHeaderComponent,
		showColumnFilter = true,
		showPagination = false,
		onChangePage,
		onChangeItemsPerPage,
		suffix = '',
		noDataText = __(
			'Please, create data to see the available list here.',
			'gamify'
		),
		totalItems = 0,
		dataFetchingStatus = false,
		resetSelected = false,
		currentPageNumber = 1,
		rowsPerPage = 10,
		Button = false,
		hoverAction = false,
	} = props;

	console.log({
		columns,
		data,
		isRowSelectable,
		getSelectRowValue,
		showSubHeader,
		subHeaderComponent,
		showColumnFilter,
		showPagination,
		onChangePage,
		onChangeItemsPerPage,
		suffix,
		noDataText,
		totalItems,
		dataFetchingStatus,
		resetSelected,
		currentPageNumber,
		rowsPerPage,
		Button,
		hoverAction,
	})

	const bodyRef = useRef( null );

	// ListTable state
	// eslint-disable-next-line
	const [isRowsPerPage, setIsRowsPerPage] = useState('10');
	const [ loadingHeight, setLoadingHeight ] = useState( '0px' );
	const [ copyDataArr, setCopyDataArr ] = useState( false );
	const [ copyColumns, setCopyColumns ] = useState(
		columns?.map( ( copyColumn, index ) => ( {
			...copyColumn,
			visible: true,
			id: `column-${ index }`,
		} ) )
	);
	const shouldRerender = _.isEqual( data, copyDataArr );

	const [ visibleColumn, setVisibleColumn ] = useState(
		copyColumns?.filter( ( copyColumn ) => copyColumn.visible )
	);
	const [ tempCopyColumns, setTempCopyColumns ] = useState( [
		...copyColumns,
	] );
	const [ showSlider, setShowSlider ] = useState( false );

	const isCheckboxColumnVisible = visibleColumn.length > 0 && isRowSelectable;

	const selectRowChange = ( { row, select } ) => {
		const updatedDataArr = copyDataArr.map( ( dataItem ) => {
			if ( dataItem.rowId === row.rowId ) {
				return { ...dataItem, select };
			}
			return dataItem;
		} );
		setCopyDataArr( updatedDataArr );
	};

	const selectAllRow = ( event ) =>
		setCopyDataArr( ( prev ) =>
			prev.map( ( prevData ) => ( {
				...prevData,
				select: event.target.checked,
			} ) )
		);

	const checkedChange = ( { id, visible } ) => {
		let updatedColumns;

		if ( id === 'reset' ) {
			updatedColumns = tempCopyColumns.map( ( column ) => ( {
				...column,
				visible: true,
			} ) );
		} else {
			updatedColumns = tempCopyColumns.map( ( column ) => {
				if ( column.id === id ) {
					return { ...column, visible };
				}
				return column;
			} );
		}

		setTempCopyColumns( updatedColumns );
	};

	const paginationPerPageChange = ( option ) => {
		setIsRowsPerPage( option.value );
		setLoadingHeight( `${ bodyRef.current.offsetHeight }px` );
		onChangeItemsPerPage(
			Number( option.value ),
			Number( currentPageNumber )
		);
	};

	// Reset copyDataArr if shouldRerender is false
	useEffect( () => {
		if ( ! shouldRerender ) {
			console.log({map: data?.map( ( row, index ) => ( {
					...row,
					rowId: `row-${ index }`,
					select: false,
				} ) )})
			setCopyDataArr(
				data?.map( ( row, index ) => ( {
					...row,
					rowId: `row-${ index }`,
					select: false,
				} ) )
			);
		}
	}, [ shouldRerender, data ] );
	console.log({shouldRerender, data})

	//side effect
	useEffect( () => {
		console.log({set: data?.map( ( row, index ) => ( {
					...row,
					rowId: `row-${ index }`,
					select: false,
				} ) )})
		setCopyDataArr(
			data &&
				data?.map( ( row, index ) => ( {
					...row,
					rowId: `row-${ index }`,
					select: false,
				} ) )
		);
	}, [ data?.length ] );

	useEffect( () => {
		if ( 0 === data.length || false === data ) {
			setLoadingHeight( '400px' );
		} else if ( bodyRef.current.offsetHeight < 100 ) {
			setLoadingHeight( `100px` );
		} else {
			setLoadingHeight( `${ bodyRef.current.offsetHeight }px` );
		}
	}, [ data?.length, bodyRef, rowsPerPage ] );

	useEffect( () => {
		const visibleColumns = copyColumns.filter(
			( item ) => item.visible === true
		);

		function handleResponsiveSlideShow() {
			if ( window.innerWidth < 1280 || visibleColumns.length > 6 ) {
				setShowSlider( true );
			} else {
				setShowSlider( false );
			}
		}

		// Add event listener for window resize
		window.addEventListener( 'resize', handleResponsiveSlideShow );

		// Initial check on component mount
		handleResponsiveSlideShow();

		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener( 'resize', handleResponsiveSlideShow );
		};
	}, [ window.innerWidth, copyColumns ] );

	useEffect( () => {
		setVisibleColumn(
			copyColumns?.filter( ( copyColumn ) => copyColumn.visible )
		);
		setLoadingHeight( false );
	}, [ copyColumns ] );

	// get Local storage data every time page refresh
	useEffect( () => {
		const localColumns = JSON.parse( localStorage.getItem( suffix ) );
		if ( localColumns ) {
			const mergeColumns = copyColumns.reduce( ( acc, column ) => {
				localColumns.forEach( ( item ) => {
					if ( item.id === column.id ) {
						acc.push( { ...item, cell: column.cell } );
					}
				} );
				return acc;
			}, [] );

			const sortColumn = localColumns.reduce( ( acc, column ) => {
				mergeColumns.forEach( ( item ) => {
					if ( column.id === item.id ) {
						acc.push( { ...item } );
					}
				} );
				return acc;
			}, [] );
			setTempCopyColumns( sortColumn );
			setCopyColumns( sortColumn );
		}
	}, [] );

	// current select row
	useEffect( () => {
		if ( typeof getSelectRowValue === 'function' ) {
			getSelectRowValue(
				copyDataArr &&
					copyDataArr?.filter( ( copyRow ) => copyRow.select )
			);
		}
	}, [ copyDataArr ] );

	// reset selected
	useEffect( () => {
		if ( resetSelected && copyDataArr ) {
			setCopyDataArr(
				copyDataArr &&
					copyDataArr?.map( ( row ) => ( { ...row, select: false } ) )
			);
		}
	}, [ resetSelected ] );

	const showPaginationData = showPagination && copyDataArr?.length > 0;

	return (
		<div
			className={ `gamify-table ${
				suffix && 'gamify-table--' + suffix
			} ${ ! is_admin ? 'gamify-dashboard__content' : '' }` }
		>
			<div className="gamify-table__container">
				{/* { showSubHeader && (
					<TableSubHeader
						subHeaderComponent={ subHeaderComponent }
						setTempCopyColumns={ setTempCopyColumns }
						tempCopyColumns={ tempCopyColumns }
						showColumnFilter={ showColumnFilter }
						checkedChange={ checkedChange }
						setCopyColumns={ setCopyColumns }
						copyColumns={ copyColumns }
						suffix={ suffix }
					/>
				) } */}

				<Table.ScrollArea maxH="500px" h={'100%'} borderWidth="1px" rounded="md" maxW="100%" marginTop={'20px'}>
					<Table.Root>
						<TableHeader
							data={ data }
							visibleColumn={ visibleColumn }
							copyDataArr={ copyDataArr }
							selectAllRow={ selectAllRow }
							isCheckboxColumnVisible={ isCheckboxColumnVisible }
						/>
						<TableBody
							dataFetchingStatus={ dataFetchingStatus }
							copyDataArr={ copyDataArr }
							visibleColumn={ visibleColumn }
							isCheckboxColumnVisible={ isCheckboxColumnVisible }
							selectRowChange={ selectRowChange }
							noDataText={ noDataText }
							button={ Button }
							hoverAction={ hoverAction }
							loadingHeight={ loadingHeight }
							bodyRef={ bodyRef }
						/>
					</Table.Root>
				</Table.ScrollArea>

				{ showPaginationData && (
					<TableFooter
						data={ data }
						totalItems={ totalItems }
						paginationPerPageChange={ paginationPerPageChange }
						rowsPerPage={ rowsPerPage }
						onChangePage={ onChangePage }
						currentPageNumber={ currentPageNumber }
					/>
				) }
			</div>
		</div>
	);
};

ListTable.propTypes = propTypes;
export default ListTable;
