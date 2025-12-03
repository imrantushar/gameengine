import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Redux imports
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Spinner } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";

// Components
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import { fetchPointTypes ,deletePointType} from '@GFRedux/Slices/pointTypeSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';

const Points = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Select data from Redux store
    // 'pointTypes' contains the formatted data
    // 'listStatus' handles the loading state
    const { pointTypes, listStatus } = useSelector((state) => state.pointType);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchPointTypes());
    }, [dispatch]);

    // Handle delete using Redux action
    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            dispatch(deletePointType(id));
        }
    };

    const columns = [
        {
            name: __('Name', 'gamify'),
            cell: (row) => (
                <Flex align="center" gap="10px">
                    <span>{row.name}</span>
                </Flex>
            ),
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
                            onClick: () => navigate(`${ route_path }admin.php?page=gamify-points&action=edit&id=${ row.id }&path=name`)
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
                            color="#4F46E5"
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
                        label={__(`Point Types`, 'gamify')}
                    />
                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${ route_path }admin.php?page=gamify-points&path=points-types`)}
                    >
                        {__('+ Add new point types', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>

                {listStatus === 'loading' ? (
                    <Flex justify="center" align="center" height="200px">
                        <Spinner />
                    </Flex>
                ) : (
                    <ListTable
                        columns={columns}
                        data={pointTypes}
                        showSubHeader={false}
                        showColumnFilter={false}
                        isRowSelectable={true} // Maintained as per your code
                        showPagination={false} // Maintained as per your code
                        noDataText="No data found"
                    />
                )}
            </Box>
        </>
    );
};

export default Points;