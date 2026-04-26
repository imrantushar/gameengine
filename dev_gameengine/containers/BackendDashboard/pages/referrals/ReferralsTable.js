import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Box, Flex, Text, Badge, Icon, IconButton, Avatar } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferrals, deleteReferral, setPage, setSearchQuery } from '@GFRedux/Slices/referralSlice/referralSlice';
import ListTable from '@GFComponents/ListTable';
import Pagination from '@GFComponents/Pagination';
import Search from '@GFComponents/Search';
import { FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const ReferralsTable = () => {
    const dispatch = useDispatch();
    const { items, totalItems, currentPage, perPage, search, status } = useSelector(state => state.referrals);

    useEffect(() => {
        dispatch(fetchReferrals({ page: currentPage, per_page: perPage, search }));
    }, [currentPage, perPage, search]);

    const handleSearch = (value) => {
        dispatch(setSearchQuery(value));
        dispatch(setPage(1));
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Are you sure you want to delete this referral record?', 'gameengine'))) {
            dispatch(deleteReferral(id));
        }
    };

    const columns = [
        {
            header: __('Referrer', 'gameengine'),
            accessor: 'referrer_name',
            cell: (row) => (
                <Flex align="center" gap="10px">
                    <Box 
                        size="8" 
                        borderRadius="full" 
                        bg="gray.100" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.600"
                        width="32px"
                        height="32px"
                    >
                        {row.referrer_name?.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                        <Text fontWeight="600" fontSize="14px">{row.referrer_name}</Text>
                        <Text fontSize="12px" color="gray.500">{row.referrer_email}</Text>
                    </Box>
                </Flex>
            ),
        },
        {
            header: __('Referee (Signed up)', 'gameengine'),
            accessor: 'referee_name',
            cell: (row) => row.referee_name ? (
                <Flex align="center" gap="10px">
                    <Box 
                        size="8" 
                        borderRadius="full" 
                        bg="gray.100" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.600"
                        width="32px"
                        height="32px"
                    >
                        {row.referee_name?.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                        <Text fontWeight="600" fontSize="14px">{row.referee_name}</Text>
                        <Text fontSize="12px" color="gray.500">{row.referee_email}</Text>
                    </Box>
                </Flex>
            ) : <Text color="gray.400">--</Text>,
        },
        {
            header: __('Status', 'gameengine'),
            accessor: 'status',
            cell: (row) => (
                <Badge 
                    colorScheme={row.status === 'converted' ? 'green' : 'orange'} 
                    textTransform="capitalize"
                    borderRadius="full"
                    px="8px"
                >
                    {row.status}
                </Badge>
            ),
        },
        {
            header: __('IP Address', 'gameengine'),
            accessor: 'ip_address',
        },
        {
            header: __('Date', 'gameengine'),
            accessor: 'created_at',
            cell: (row) => moment(row.created_at).format('MMM D, YYYY h:mm A'),
        },
        {
            header: __('Action', 'gameengine'),
            accessor: 'id',
            cell: (row) => (
                <Flex justify="center">
                    <Box 
                        as="button"
                        onClick={() => handleDelete(row.id)}
                        p="8px"
                        borderRadius="4px"
                        color="red.500"
                        _hover={{ bg: "red.50" }}
                        transition="all 0.2s"
                        title={__('Delete referral', 'gameengine')}
                    >
                        <Icon as={FiTrash2} boxSize="18px" />
                    </Box>
                </Flex>
            ),
        },
    ];

    return (
        <Box bg="white" borderRadius="8px" border="1px solid var(--gameengine-border-color)" overflow="hidden">
            <ListTable 
                columns={columns} 
                data={items} 
                loading={status === 'loading'} 
                suffix="referrals"
                subHeaderComponent={
                    <Search 
                        placeholder={__('Search referrals...', 'gameengine')} 
                        onSearch={handleSearch} 
                    />
                }
            />

            <Pagination
                totalItems={totalItems}
                perPage={perPage}
                currentPage={currentPage}
                onPageChange={(page) => dispatch(setPage(page))}
            />
        </Box>
    );
};

export default ReferralsTable;
