// import React, { useState, useMemo } from 'react';
// import TopBar from "@Components/TopBar";
// import GFLabel from '@Components/Labels/GFLabel';
// import { __ } from '@wordpress/i18n';
// import ListTable from '@Components/ListTable';
// import { Box, Button, Flex, Icon } from '@chakra-ui/react';
// import OptionMenu from '@Components/OptionMenu';
// import { FiEdit, FiTrash2 } from "react-icons/fi";
// import { primaryBtn } from '../../../../assets/scss/chakra/recipe';
// import { useNavigate } from 'react-router-dom';
// import Search from '@Components/Search';
// import StatusOptions from '@Components/StatusOptions';


// const initialData = [
//     { id: 1, name: "John Doe", pluralName: "John Does", date: "2025-01-10", status: "pending" },
//     { id: 2, name: "Emma Watson", pluralName: "Emma Watsons", date: "2025-01-12", status: "draft" },
//     { id: 3, name: "Mark Tailor", pluralName: "Mark Tailors", date: "2025-01-15", status: "publish" },
//     { id: 4, name: "Sarah Lee", pluralName: "Sarah Lees", date: "2025-01-18", status: "trash" },
//     { id: 5, name: "David Kim", pluralName: "David Kims", date: "2025-01-20", status: "processing" },
// ];


// const Logs = () => {
//     const navigate = useNavigate();

//     const [tableData, setTableData] = useState(initialData);

//     const columns = useMemo(() => [
//         {
//             name: __('Title', 'gamify'),
//             cell: (row) => row.name
//         },
//         {
//             name: __('Questions', 'gamify'),
//             cell: (row) => row.pluralName,
//         },
//         {
//             name: __('Last Modified', 'gamify'),
//             cell: (row) => row.date,
//         },
//         {
//             name: __('Participants', 'gamify'),
//             cell: () => 0,
//         },

//         {
//             name: __('Status', 'gamify'),
//             cell: (row) => {
//                 const scheduleStatus = [
//                     { label: __('Draft', 'gamify'), value: 'draft' },
//                     { label: __('Pending', 'gamify'), value: 'pending' },
//                     { label: __('Trash', 'gamify'), value: 'trash' },
//                 ];

//                 const restStatus =
//                     row.status !== 'future'
//                         ? [{ label: __('Published', 'gamify'), value: 'publish' }]
//                         : [];
//                 const handleStatusChange = (id, newStatus) => {
//                     setTableData(prev =>
//                         prev.map(item =>
//                             item.id === id ? { ...item, status: newStatus } : item
//                         )
//                     );
//                 };

//                 return (
//                     <StatusOptions
//                         value={row.status}
//                         options={{ items: [...scheduleStatus, ...restStatus] }}
//                         onChangeHandler={(newVal) => handleStatusChange(row.id, newVal)}
//                     />
//                 );
//             },
//         },

//         {
//             name: __('Action', 'gamify'),
//             cell: (row) => (
//                 <OptionMenu
//                     options={[
//                         {
//                             type: "button",
//                             label: __('Edit', 'gamify'),
//                             icon: <Icon as={FiEdit} />,
//                             onClick: () => console.log(`Edit ID: ${row.id}`),
//                         },
//                         {
//                             type: "button",
//                             suffix: "trash",
//                             label: __('Delete', 'gamify'),
//                             icon: <Icon as={FiTrash2} />,
//                             onClick: () => console.log(`Delete ID: ${row.id}`),
//                         },
//                     ]}
//                 />
//             ),
//         },
//     ], [tableData]);


//     const subHeaderComponentMemo = useMemo(() => {
//         return (
//             <>
//                 <div className="gamify-table__sub-header-left">
//                     <GFLabel
//                         as="h2"
//                         color="var(--gamify-font-color)"
//                         fontWeight="700"
//                         fontSize='16px'
//                         label={__(`Logs`, 'gamify')}
//                     />

//                     <Button
//                         background='#F6F7F8'
//                         variant="outline"
//                         borderRadius="md"
//                         color="gray.700"
//                         fontWeight='400'
//                         fontSize='12px'
//                         width='54px'
//                         height='24px'
//                         marginLeft='5px'
//                         borderColor="gray.300"
//                     >
//                         refresh
//                     </Button>
//                 </div>

//                 <div className="gamify-table-sub-header-actions-right">
//                     <Search placeholder={__('Search Items', 'gamify')} />
//                 </div>
//             </>
//         );
//     }, []);


//     return (
//         <>
//             <TopBar
//                 leftContent={() => (
//                     <>
//                         <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" />
//                         <span className="gamify-icon gamify-icon--angle-right" />
//                         <GFLabel
//                             as="h2"
//                             color="var(--gamify-font-color)"
//                             type="subtitle"
//                             fontWeight="medium"
//                             label={__(`Game Engine`, 'gamify')}
//                         />
//                     </>
//                 )}
//             />

//             <Box width="1174px" margin="0 auto" height="100vh">
//                 <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
//                     <GFLabel
//                         type="title"
//                         fontWeight="500"
//                         fontSize="xl"
//                         label={__(`Logs`, 'gamify')}
//                     />

//                     <Button {...primaryBtn}>
//                         {__('+ Add new point types', 'gamify')}
//                         <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
//                     </Button>
//                 </Flex>

//                 <ListTable
//                     columns={columns}
//                     isRowSelectable={true}
//                     data={tableData}
//                     showSubHeader={true}
//                     subHeaderComponent={subHeaderComponentMemo}
//                     showColumnFilter={false}
//                     showPagination={true}
//                     noDataText="No data found"
//                 />
//             </Box>
//         </>
//     );
// };

// export default Logs;
import React, { useState, useMemo } from 'react';
import TopBar from "@Components/TopBar";
import GFLabel from '@Components/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@Components/ListTable';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import OptionMenu from '@Components/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { primaryBtn } from '../../../../assets/scss/chakra/recipe';
import { useNavigate } from 'react-router-dom';
import Search from '@Components/Search';
import StatusOptions from '@Components/StatusOptions';

const initialData = [
{ id: 1, name: "John Doe", pluralName: "John Does", date: "2025-01-10", status: "pending" },
{ id: 2, name: "Emma Watson", pluralName: "Emma Watsons", date: "2025-01-12", status: "draft" },
{ id: 3, name: "Mark Tailor", pluralName: "Mark Tailors", date: "2025-01-15", status: "publish" },
{ id: 4, name: "Sarah Lee", pluralName: "Sarah Lees", date: "2025-01-18", status: "trash" },
{ id: 5, name: "David Kim", pluralName: "David Kims", date: "2025-01-20", status: "processing" },
{ id: 6, name: "Alice Brown", pluralName: "Alice Browns", date: "2025-01-22", status: "pending" },
{ id: 7, name: "Bob Smith", pluralName: "Bob Smiths", date: "2025-01-25", status: "draft" },
{ id: 8, name: "Charlie Johnson", pluralName: "Charlie Johnsons", date: "2025-01-28", status: "publish" },
{ id: 9, name: "Diana White", pluralName: "Diana Whites", date: "2025-02-01", status: "trash" },
{ id: 10, name: "Ethan Davis", pluralName: "Ethan Davises", date: "2025-02-05", status: "processing" },
{ id: 11, name: "Fiona Green", pluralName: "Fiona Greens", date: "2025-02-10", status: "pending" },
{ id: 12, name: "George Harris", pluralName: "George Harrises", date: "2025-02-12", status: "draft" },
{ id: 13, name: "Hannah Lewis", pluralName: "Hannah Lewises", date: "2025-02-15", status: "publish" },
{ id: 14, name: "Ian Clark", pluralName: "Ian Clarks", date: "2025-02-18", status: "trash" },
{ id: 15, name: "Jane Walker", pluralName: "Jane Walkers", date: "2025-02-20", status: "processing" },
{ id: 16, name: "Kevin Hall", pluralName: "Kevin Halls", date: "2025-02-22", status: "pending" },
{ id: 17, name: "Laura Allen", pluralName: "Laura Allens", date: "2025-02-25", status: "draft" },
{ id: 18, name: "Michael Young", pluralName: "Michael Youngs", date: "2025-02-28", status: "publish" },
{ id: 19, name: "Nina King", pluralName: "Nina Kings", date: "2025-03-01", status: "trash" },
{ id: 20, name: "Oscar Scott", pluralName: "Oscar Scotts", date: "2025-03-05", status: "processing" },
];


const Logs = () => {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState(initialData);
    const allData = tableData;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const totalItems = allData.length;
    const paginatedData = allData.slice(
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
            name: __('Title', 'gamify'),
            cell: (row) => row.name
        },
        {
            name: __('Questions', 'gamify'),
            cell: (row) => row.pluralName,
        },
        {
            name: __('Last Modified', 'gamify'),
            cell: (row) => row.date,
        },
        {
            name: __('Participants', 'gamify'),
            cell: () => 0,
        },

        {
            name: __('Status', 'gamify'),
            cell: (row) => {
                const scheduleStatus = [
                    { label: __('Draft', 'gamify'), value: 'draft' },
                    { label: __('Pending', 'gamify'), value: 'pending' },
                    { label: __('Trash', 'gamify'), value: 'trash' },
                ];

                const restStatus =
                    row.status !== 'future'
                        ? [{ label: __('Published', 'gamify'), value: 'publish' }]
                        : [];

                const handleStatusChange = (id, newStatus) => {
                    setTableData(prev =>
                        prev.map(item =>
                            item.id === id ? { ...item, status: newStatus } : item
                        )
                    );
                };

                return (
                    <StatusOptions
                        value={row.status}
                        options={{ items: [...scheduleStatus, ...restStatus] }}
                        onChangeHandler={(newVal) => handleStatusChange(row.id, newVal)}
                    />
                );
            },
        },

        {
            name: __('Action', 'gamify'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: "button",
                            label: __('Edit', 'gamify'),
                            icon: <Icon as={FiEdit} />,
                            onClick: () => console.log(`Edit ID: ${row.id}`),
                        },
                        {
                            type: "button",
                            suffix: "trash",
                            label: __('Delete', 'gamify'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => console.log(`Delete ID: ${row.id}`),
                        },
                    ]}
                />
            ),
        },
    ], [tableData]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <>
                <div className="gamify-table__sub-header-left">
                    <GFLabel
                        as="h2"
                        color="var(--gamify-font-color)"
                        fontWeight="700"
                        fontSize='16px'
                        label={__(`Logs`, 'gamify')}
                    />

                    <Button
                        background='#F6F7F8'
                        variant="outline"
                        borderRadius="md"
                        color="gray.700"
                        fontWeight='400'
                        fontSize='12px'
                        width='54px'
                        height='24px'
                        marginLeft='5px'
                        borderColor="gray.300"
                    >
                        refresh
                    </Button>
                </div>

                <div className="gamify-table-sub-header-actions-right">
                    <Search placeholder={__('Search Items', 'gamify')} />
                </div>
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
                            label={__(`Game Engine`, 'gamify')}
                        />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" height="100vh">
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Logs`, 'gamify')}
                    />

                    <Button {...primaryBtn}>
                        {__('+ Add new point types', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>

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

export default Logs;
