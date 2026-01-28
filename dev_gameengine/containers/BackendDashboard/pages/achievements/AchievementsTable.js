import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Button, Flex, Icon, Badge, CheckboxGroup, Box, Text } from '@chakra-ui/react';
import OptionMenu from '@GFComponents/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { deleteAchievement, fetchAchievements, updateAchievement } from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path, statusArray, tableStatusArray } from '@GFUtils/helper';
import { GoPlus } from 'react-icons/go';
import { fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import moment from 'moment';
import Search from '@GFComponents/Search';
import StatusOptions from '@GFComponents/StatusOptions';

const AchievementsTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { achievements, types, page, perPage, total, search  } = useSelector(state => state.achievements);
    const [loading, setLoading] = useState(achievements.length === 0);
    const [tableStats, setTableStatus] = useState('all');
    const fetchHandler = async ({status = 'all', page = 1, per_page = 15, searchKey = ""}) => {
        try {
            setLoading(true)
            await dispatch(fetchAchievements({status, page, per_page, search: searchKey}));
        } catch (error) {
            console.warn(error)
        } finally {
            setLoading(false)
        }
      }

    useEffect(() => {
        if(types.data?.length === 0) {
            dispatch(fetchAchievementTypes())
        }
        fetchHandler({status: tableStats, page, per_page: perPage})
    }, []);

    const handleDelete = (id) => {
        if (confirm(__('Are you sure?', 'gameengine'))) {
            dispatch(deleteAchievement(id));
        }
    };

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row = {}) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: "pointer" }} onClick={() => navigate(`${route_path}admin.php?page=gameengine-achievements&action=edit&id=${row?.id}`)}
                >
                    {row?.badge_image && <img src={row?.badge_image} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row?.title}</span>
                </div>
            ),
            columnWidth: "180px",
            textAlign: "start",
        },
        {
            name: __('Category', 'gameengine'),
            cell: (row = {}) => {
                const category = types.data.find(item => Number(row?.category_id) === Number(item.id));
                if(!category) return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
                return (
                    <Badge variant="subtle" borderRadius="4px" px={2}>
                        {category?.name}
                    </Badge>
                )
            },
        },
        {
            name: __('Date', 'gameengine'),
            cell: (row) => (
                <Box>
                    <Text margin={0}>{moment(row?.created_at).format('MMMM DD, YYYY')}</Text>
                    <Text margin={0} className="academy-table-time">
                        {moment(row?.created_at).format('h:mm A')}
                    </Text>
                </Box>
            ),
        },
        {
            name: __('Status', 'gameengine'),
            cell: (row) => {
                const statusUpdateHandler = (itemStatus) => {
                    const updatedData = {...row, status: itemStatus};
                    dispatch(updateAchievement({id:row.id, data: updatedData}))
                }
                return (
                    <StatusOptions
                        value={row?.status}
                        options={{
                            items: [...statusArray],
                        }}
                        onChangeHandler={statusUpdateHandler}
                    />
                )
            },
            width: "15%",
        },
        {
            name: __('Action', 'gameengine'),
            cell: (row = {}) => {
                const trashAction = tableStats !== 'trash' ? [{
                    type: 'button',
                    suffix: 'trash',
                    label: __('Trash', 'gameengine'),
                    icon: <Icon as={FiTrash2} />,
                    onClick: () => dispatch(updateAchievement({id:row.id, data: {...row, status: 'trash'}}))
                }] : [{
                    type: 'button',
                    suffix: 'trash',
                    label: __('Delete', 'gameengine'),
                    icon: <Icon as={FiTrash2} />,
                    onClick: () => handleDelete(row?.id)
                }]
                return (
                    <OptionMenu
                        options={[
                            {
                                type: 'button',
                                label: __('Edit', 'gameengine'),
                                icon: <Icon as={FiEdit} />,
                                onClick: () => navigate(`${route_path}admin.php?page=gameengine-achievements&action=edit&id=${row?.id}`)
                            },
                            ...trashAction,
                        ]}
                    />
                )
            },
            textAlign: "end",
        },
    ];

    const subHeaderComponentMemo = useMemo(() => {
        const searchHandler = (value="") => {
            fetchHandler({status: tableStats, page, per_page: perPage, searchKey: value })
        };

        return (
            <Flex justifyContent={'space-between'} width={'100%'}>
                <Flex className='gameengine-table-subheader-left' justifyContent={'space-between'}>
                    {tableStatusArray.map((item, index) => (
                    <Button
                        minW={'auto'} 
                        variant={'plain'} 
                        onClick={() => {
                            setTableStatus(item.value)
                            fetchHandler({ status: item.value, page: 1, per_page: 15 })
                        }}
                        key={index}
                        bg={'transparent'}
                        height={'auto'}
                        fontSize={'12px'}
                        fontWeight={'500'}
                        lineHeight={'20px'}
                        color={'var(--gameengine-font-color)'}
                        paddingInline={'0'}
                        padding={'16px 16px 0 16px'}
                        _after={{
                            content: '""',
                            position: "absolute",
                            left: 0,
                            bottom: "-18px",
                            width: "100%",
                            height: "2px",
                            bg: "var(--gameengine-primary)",
                            transform:
                                tableStats === item.value ? "scaleX(1)" : "scaleX(0)",
                            transformOrigin: "left",
                            transition: "transform 0.2s ease",
                        }}
                        _hover={{
                            _after: {
                                transform: "scaleX(1)", 
                            },
                        }}
                    >{item.label}</Button>
                    ))}
                </Flex>

                <Box className='gameengine-table-subheader-right'>
                    <Search
                        placeholder='Search question'
                        onSearchHandler={searchHandler}
                        defaultValue={search ? search : ''}
                    />
                </Box>
            </Flex>
        );
    }, [tableStats, search]);

    return (
        <div className='gameengine-page-content'>
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Achievements", "gameengine")} />

                <Button
                    {...primaryBtn}
                    onClick={() => navigate(`${route_path}admin.php?page=gameengine-achievements&action=new`)}
                >
                    <Icon as={GoPlus} boxSize="20px" /> {__('Add new achievement', 'gameengine')}
                </Button>
            </Flex>

            <ListTable
                key={'acievements-table-'+ achievements?.length}
                columns={columns}
                data={achievements}
                showSubHeader={true}
                showColumnFilter={false}
                isRowSelectable={false}
                showPagination={false}
                noDataText={__("No data found for Achievements", "gameengine")}
                suffix="achievements-table"
                subHeaderComponent={subHeaderComponentMemo}
                totalItems={total}
                totalRows={achievements.length}
                dataFetchingStatus={loading}
                // resetSelected={resetSelectedItems}
                rowsPerPage={perPage}
                currentPageNumber={[page]}

            />
        </div>
    );
};

export default AchievementsTable;
