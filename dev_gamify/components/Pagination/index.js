import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@chakra-ui/react';

import './styles.scss';

const propTypes = {
	totalItems: PropTypes.number,
	currentPageNumber: PropTypes.number,
	fetchHandler: PropTypes.func,
	rowsPerPage: PropTypes.number,
};

const Pagination = ({
	totalItems = 0,
	currentPageNumber = 1,
	fetchHandler = () => { },
	rowsPerPage = 10,
}) => {
	const [page, setPage] = useState(
		currentPageNumber ? currentPageNumber : 1
	);

	const totalPages = Math.ceil(totalItems / rowsPerPage) || 0;
	const renderFirstPage = rowsPerPage >= totalItems ? 1 : currentPageNumber;

	const pageNumbers = Array.from(
		{ length: totalPages },
		(_, index) => index + 1
	);

	const showNextButton =
		page < pageNumbers.length && totalItems > rowsPerPage;
	const showPrevButton = page > 1 && totalItems > rowsPerPage;

	useEffect(() => {
		setPage(renderFirstPage);
	}, [rowsPerPage]);

	useMemo(() => {
		if (currentPageNumber !== page) {
			setPage(currentPageNumber);
		}
	}, [currentPageNumber])

	const handlePageChange = (newPage) => {
		setPage(newPage);
		fetchHandler(newPage, rowsPerPage);
	};

	const renderPageNumbers = () => {
		const renderedPages = [];

		if (pageNumbers.length <= 5) {
			// when total number of pages is less than or equal to 5, render all the page numbers
			pageNumbers.forEach((item, index) => {
				const pageItem = (
					<li
						className={`gamify-pagination-list__item ${item === page &&
							'gamify-pagination-list__item-active'
							}`}
						key={index}
						onClick={() => {
							handlePageChange(item);
						}}
						role="presentation"
					>
						{item}
					</li>
				);
				renderedPages.push(pageItem);
			});
		} else if (page <= 3) {
			// when current page is within the first three pages
			for (let i = 1; i <= 3; i++) {
				const pageItem = (
					<li
						className={`gamify-pagination-list__item ${i === page &&
							'gamify-pagination-list__item-active'
							}`}
						key={i}
						onClick={() => {
							handlePageChange(i);
						}}
						role="presentation"
					>
						{i}
					</li>
				);
				renderedPages.push(pageItem);
			}
			renderedPages.push(
				<li
					className="gamify-pagination-list__item gamify-pagination-list__item-dots"
					key="dots"
				>
					...
				</li>
			);
			const lastPageItem = (
				<li
					className="gamify-pagination-list__item"
					key={totalPages}
					onClick={() => {
						handlePageChange(totalPages);
					}}
					role="presentation"
				>
					{totalPages}
				</li>
			);
			renderedPages.push(lastPageItem);
		} else if (page >= totalPages - 2) {
			// when current page is within the last three pages
			const firstPageItem = (
				<li
					className="gamify-pagination-list__item"
					key={1}
					onClick={() => {
						handlePageChange(1);
					}}
					role="presentation"
				>
					{1}
				</li>
			);
			renderedPages.push(firstPageItem);
			renderedPages.push(
				<li
					className="gamify-pagination-list__item gamify-pagination-list__item-dots"
					key="dots"
				>
					...
				</li>
			);
			for (let i = totalPages - 2; i <= totalPages; i++) {
				const pageItem = (
					<li
						className={`gamify-pagination-list__item ${i === page &&
							'gamify-pagination-list__item-active'
							}`}
						key={i}
						onClick={() => {
							handlePageChange(i);
						}}
						role="presentation"
					>
						{i}
					</li>
				);
				renderedPages.push(pageItem);
			}
		} else {
			// If the current page is in the middle range
			const firstPageItem = (
				<li
					className="gamify-pagination-list__item"
					key={1}
					onClick={() => {
						handlePageChange(1);
					}}
					role="presentation"
				>
					{1}
				</li>
			);
			renderedPages.push(firstPageItem);
			renderedPages.push(
				<li
					className="gamify-pagination-list__item gamify-pagination-list__item-dots"
					key="dots-start"
				>
					...
				</li>
			);
			for (let i = page - 1; i <= page + 1; i++) {
				const pageItem = (
					<li
						className={`gamify-pagination-list__item ${i === page &&
							'gamify-pagination-list__item-active'
							}`}
						key={i}
						onClick={() => {
							handlePageChange(i);
						}}
						role="presentation"
					>
						{i}
					</li>
				);
				renderedPages.push(pageItem);
			}
			renderedPages.push(
				<li
					className="gamify-pagination-list__item gamify-pagination-list__item-dots"
					key="dots-end"
				>
					...
				</li>
			);
			const lastPageItem = (
				<li
					className="gamify-pagination-list__item"
					key={totalPages}
					onClick={() => {
						handlePageChange(totalPages);
					}}
					role="presentation"
				>
					{totalPages}
				</li>
			);
			renderedPages.push(lastPageItem);
		}

		return renderedPages;
	};

	return (
		<div className="gamify-pagination">
			{showPrevButton && (
				<>
					<Button
						color="var(--gamify-font-color)"
						borderColor="var(--gamify-border-color)"
						borderWidth="1px"
						bg="transparent"
						_hover={{
							bg: 'var(--gamify-body-background)',
						}}
						height="auto"
						padding="6px"
						onClick={() => {
							handlePageChange(1);
						}}
					>
						<span>
							<span className="gamify-icon gamify-icon--angle-left" />
							<span className="gamify-icon gamify-icon--angle-left" />
						</span>
					</Button>
					<Button
						color="var(--gamify-font-color)"
						borderColor="var(--gamify-border-color)"
						borderWidth="1px"
						bg="transparent"
						_hover={{
							bg: 'var(--gamify-body-background)',
						}}
						height="auto"
						padding="6px"
						onClick={() => {
							handlePageChange(page - 1);
						}}
					>
						<span className="gamify-icon gamify-icon--angle-left" />
					</Button>
				</>
			)}
			{pageNumbers.length > 1 && (
				<ul className="gamify-pagination-list">
					{renderPageNumbers()}
				</ul>
			)}
			{showNextButton && (
				<>
					<Button
						color="var(--gamify-font-color)"
						borderColor="var(--gamify-border-color)"
						borderWidth="1px"
						bg="transparent"
						_hover={{
							bg: 'var(--gamify-body-background)',
						}}
						height="auto"
						padding="6px"
						onClick={() => {
							handlePageChange(page + 1);
						}}
					>
						<span className="gamify-icon gamify-icon--angle-right" />
					</Button>
					<Button
						color="var(--gamify-font-color)"
						borderColor="var(--gamify-border-color)"
						borderWidth="1px"
						bg="transparent"
						_hover={{
							bg: 'var(--gamify-body-background)',
						}}
						height="auto"
						padding="6px"
						onClick={() => {
							handlePageChange(pageNumbers.length);
						}}
					>
						<span>
							<span className="gamify-icon gamify-icon--angle-right" />
							<span className="gamify-icon gamify-icon--angle-right" />
						</span>
					</Button>
				</>
			)}
		</div>
	);
};

Pagination.propTypes = propTypes;
export default Pagination;
