import React, { useState, useMemo } from 'react';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Box, Button, Flex } from '@chakra-ui/react';
import GFSelect from '@GFComponents/Select';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';


const initialData = [
    {
        id: 1,
        rank: "#1",
        user: "James Smith",
        points: "10,000",
        achievements: 5,
        level: "Diamond",
    },
    {
        id: 2,
        rank: "#2",
        user: "Stive Smith",
        points: "9,000",
        achievements: 3,
        level: "Gold",
    },
    {
        id: 3,
        rank: "#3",
        user: "Ajar Lutron",
        points: "8,000",
        achievements: 3,
        level: "Silver",
    },
    {
        id: 4,
        rank: "#4",
        user: "Martin Luther",
        points: "6,000",
        achievements: 2,
        level: "Silver",
    },
];



const Leaderboards = () => {
    const [tableData] = useState(initialData);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalItems = tableData.length;

    const paginatedData = tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePerPageChange = (newLimit) => {
        setRowsPerPage(newLimit);
        setCurrentPage(1);
    };

    const columns = useMemo(() => [
        {
            name: __('Rank', 'gamify'),
            cell: (row) => row.rank,
        },
        {
            name: __('User', 'gamify'),
            cell: (row) => row.user,
        },
        {
            name: __('Points', 'gamify'),
            cell: (row) => (
                <span>🪙 {row.points}</span>
            ),
        },
        {
            name: __('Achievements', 'gamify'),
            cell: (row) => (
                <span>🏆 {row.achievements}</span>
            ),
        },
        {
            name: __('Level', 'gamify'),
            cell: (row) => row.level,
        },
    ], []);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <>
                <div className="gamify-table__sub-header-left">
                    <GFLabel
                        as="h2"
                        color="var(--gamify-font-color)"
                        fontWeight="700"
                        fontSize='16px'
                        label={__(`Gamify Pro Leaderboard`, 'gamify')}
                    />
                </div>

                <Flex gap='12px' style={{ width: '600px' }} className="gamify-table-sub-header-actions-right">
                    <GFSelect
                        label="Select Points"
                        placeholder="Choose one"
                        items={[
                            { label: 'Unlimited', value: 'unlimited' },
                            { label: '1 per day', value: '1_per_day' },
                            { label: '1 time only', value: '1_time' },
                        ]}
                        value={['']}
                    />
                    <GFSelect
                        label="Time Range"
                        placeholder="Choose one"
                        items={[
                            { label: 'Unlimited', value: 'unlimited' },
                            { label: '1 per day', value: '1_per_day' },
                            { label: '1 time only', value: '1_time' },
                        ]}
                        value={['']}

                    />
                    <Flex
                        marginTop='25px'>
                        <Button
                            {...primaryBtn}

                        >
                            {__('Search', 'gamify')}
                        </Button>
                    </Flex>
                </Flex>
            </>
        );
    }, []);

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" />
                        <span className="gamify-icon gamify-icon--angle-right" />
                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="medium"
                            label={__(`Dashboard`, 'gamify')}
                        />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto">

                <ListTable
                    columns={columns}
                    isRowSelectable={true}
                    data={paginatedData}
                    showSubHeader={true}
                    subHeaderComponent={subHeaderComponentMemo}
                    showColumnFilter={false}
                    showPagination={true}
                    noDataText="No data found"
                    totalItems={totalItems}
                    currentPageNumber={currentPage}
                    rowsPerPage={rowsPerPage}
                    onChangePage={handlePageChange}
                    onChangeItemsPerPage={handlePerPageChange}
                />

            </Box>
        </>
    );
};

export default Leaderboards;
