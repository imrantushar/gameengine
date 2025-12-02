import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import OptionMenu from '@GFComponents/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { fetchAchievements, deleteAchievement } from '@GFRedux/Slices/achievementsSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

const Achievements = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { achievements } = useSelector(state => state.achievements);

    useEffect(() => {
        dispatch(fetchAchievements());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (confirm(__('Are you sure?', 'gamify'))) {
            dispatch(deleteAchievement(id));
        }
    };

    const columns = [
        {
            name: __('Name', 'gamify'),
            cell: (row) => row.title
        },
        {
            name: __('Plural Name', 'gamify'), // Mapped to Description for UI consistency
            cell: (row) => row.description,
        },
        {
            name: __('Date', 'gamify'),
            cell: (row) => new Date(row.created_at).toLocaleDateString(),
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
                            onClick: () => navigate(`/achievementsType?id=${row.id}`)
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gamify'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => handleDelete(row.id)
                        },
                    ]}
                />
            ),
        },
    ];

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
                        {__('+ Add new achievement type', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>
                <ListTable
                    columns={columns}
                    data={achievements}
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