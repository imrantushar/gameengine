import React from 'react';
import TopBar from "@Components/TopBar";
import GFLabel from '@Components/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@Components/ListTable';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import OptionMenu from '@Components/OptionMenu';
import { FiEdit } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { primaryBtn } from '../../../../assets/scss/chakra/recipe';
import { useNavigate } from 'react-router-dom';


const staticData = [
    { id: 1, name: "John Doe", pluralName: "John Does", date: "2025-01-10" },
    { id: 2, name: "Emma Watson", pluralName: "Emma Watsons", date: "2025-01-12" },
    { id: 3, name: "Mark Tailor", pluralName: "Mark Tailors", date: "2025-01-15" },
    { id: 4, name: "Sarah Lee", pluralName: "Sarah Lees", date: "2025-01-18" },
    { id: 5, name: "David Kim", pluralName: "David Kims", date: "2025-01-20" },
];

const columns = [
    {
        name: __('Name', 'gamify'),
        cell: (row) => row.name
    },
    {
        name: __('Plural Name', 'gamify'),
        cell: (row) => row.pluralName,
    },
    {
        name: __('Date', 'gamify'),
        cell: (row) => row.date,
    },
    {
        name: __('Action', 'gamify'),
        cell: (row) => (
            <OptionMenu
                options={[
                    {
                        type: 'button',
                        label: __('Edit', 'gamify'),
                        icon: <Icon as={FiEdit} />,
                        onClick: () => console.log(`Edit ID: ${row.id}`)
                    },
                    {
                        type: 'button',
                        suffix: 'trash',
                        label: __('Delete', 'gamify'),
                        icon: <Icon as={FiTrash2} />,
                        onClick: () => console.log(`Delete ID: ${row.id}`)
                    },
                ]}
            />
        ),
    },
];

const Achievements = () => {
    const navigate = useNavigate();
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
                        label={__(`Achievement Types`, 'gamify')}
                    />
                    <Button
                        {...primaryBtn}
                        onClick={() => navigate("/achievementsType")}

                    >
                        {__('+ Add new point types', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>
                <ListTable
                    columns={columns}
                    data={staticData}
                    showSubHeader={false}
                    showColumnFilter={false}
                    isRowSelectable={true}
                    showPagination={false}
                    noDataText="No data found"
                />
            </Box>

        </>
    );
};

export default Achievements;
