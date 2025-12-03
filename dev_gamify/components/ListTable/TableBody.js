import React from 'react';
import { __ } from '@wordpress/i18n';

import Preloader from '@GFComponents/Loader/Preloader';
import CustomTableMessage from '@GFComponents/Oops/CustomTableMessage';

const TableBody = ( {
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
} ) => {
	const isLoading = dataFetchingStatus || ! copyDataArr;

	return (
		<div className="gamify-table__body-wrap" ref={ bodyRef }>
			{ isLoading ? (
				<div
					className="gamify-table__loader"
					style={ { minHeight: loadingHeight } }
				>
					<Preloader />
				</div>
			) : (
				<>
					{ copyDataArr?.length > 0 ? (
						<>
							{ copyDataArr?.map( ( row, index ) => (
								<div
									key={ index }
									className={ `gamify-table__body-row-wrap ${
										hoverAction
											? 'gamify-table__body-row-hovered'
											: ''
									}` }
								>
									{ isCheckboxColumnVisible && (
										<div className="gamify-table__row-cell gamify-table__row-cell-checkbox ">
											<input
												type="checkbox"
												checked={ row.select }
												onChange={ ( event ) =>
													selectRowChange( {
														row,
														select: event.target
															.checked,
													} )
												}
											/>
										</div>
									) }
									{ visibleColumn.length > 0 ? (
										<>
											{ visibleColumn?.map(
												(
													copyColumn,
													copyColumnIndex
												) => (
													<>
														<div
															className={ `gamify-table__body-row-cell ${
																hoverAction
																	? 'gamify-table__row-cell-hovered'
																	: ''
															} ${
																copyColumn.isWidth ??
																'gamify-table__body-row-cell-width'
															}` }
															key={
																copyColumnIndex
															}
														>
															{ copyColumn?.cell(
																row,
																index
															) }

															{ copyColumnIndex ===
																0 &&
																hoverAction &&
																typeof hoverAction.cell ===
																	'function' && (
																	<span className="gamify-table__hover-action">
																		{ hoverAction.cell(
																			row,
																			index
																		) }
																	</span>
																) }
														</div>
													</>
												)
											) }
										</>
									) : (
										<CustomTableMessage
											title={ __(
												'No visible columns available!!',
												'gamify'
											) }
										/>
									) }
								</div>
							) ) }
						</>
					) : (
						<CustomTableMessage
							title={ __( 'No Data Available!!!', 'gamify' ) }
							subText={ noDataText }
							button={ button }
						/>
					) }
				</>
			) }
		</div>
	);
};

export default TableBody;
