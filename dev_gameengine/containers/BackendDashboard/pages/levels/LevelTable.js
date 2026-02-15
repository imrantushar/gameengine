import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Icon, Badge, Box, Text } from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { API, banners, namespace, route_path, statusArray, tableStatusArray } from '@GFUtils/helper';
import { fetchLevels, deleteLevel, updateLevel } from '../../../../redux/Slices/levelsSlice/levelsSlice';
import { GoPlus } from 'react-icons/go';
import { fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';
import moment from 'moment';
import StatusOptions from '@GFComponents/StatusOptions';
import Search from '@GFComponents/Search';
import ImportDemoBanner from '@GFComponents/ImportDemoBanner';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';

const LevelTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { levels = [], types, page, perPage, total, search } = useSelector(state => state.levels || {});
    const [loading, setLoading] = useState(levels.length === 0);
    const [tableStats, setTableStatus] = useState('all');
    const [actionSelected, setActionSelected] = useState({
            value: false,
            type: '',
            message: '',
          });
    const [selectedRows, setSelectedRows] = useState([]);
    const [originalStages, setOriginalStages] = useState({});
    const fetchHandler = async ({status = 'all', page = 1, per_page = 15, searchKey = ""}) => {
        try {
            setLoading(true)
            await dispatch(fetchLevels({status, page, per_page, search: searchKey}));
        } catch (error) {
            console.warn(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(types.data?.length === 0) {
            dispatch(fetchLevelTypes())
        }
        if(!levels || (levels && levels.length <= 1)) {
            fetchHandler({status: tableStats, page, per_page: perPage})
        }
    }, []);

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(`${route_path}admin.php?page=gameengine-levels&path=levels-types&id=${row.id}`)}>
                    {/* Optional: Show Level Icon if available */}
                    {row.icon && <img src={row.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row.title}</span>
                </div>
            ),
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
            name: __('Unlock Criteria', 'gameengine'),
            cell: (row) => parseInt(row.unlock_with_points_enabled)
                ? `${row.min_points} - ${row.max_points} Points`
                : 'Triggers'
        },
        {
            name: __('Date', 'gameengine'),
            cell: (row) => (
                <Box>
                    <Text margin={0}>{moment(row?.created_at).format('MMMM DD, YYYY')}</Text>
                    {/* <Text margin={0} className="academy-table-time">
                        {moment(row?.created_at).format('h:mm A')}
                    </Text> */}
                </Box>
            )
        },
        {
            name: __('Status', 'gameengine'),
            cell: (row) => {
                const statusUpdateHandler = (itemStatus) => {
                    const updatedData = {...row, status: itemStatus};
                    dispatch(updateLevel({id:row.id, payload: updatedData}))
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
                    type: "button", 
                    suffix: "trash",
                    label: __('Delete', 'gameengine'),
                    icon: <Icon as={FiTrash2} />,
                    onClick: () =>  dispatch(updateLevel({id:row.id, payload: {...row, status: 'trash'}}))
                }] : [{
                    type: 'button',
                    suffix: 'trash',
                    label: __('Delete', 'gameengine'),
                    icon: <Icon as={FiTrash2} />,
                    onClick: () => handleDelete(row?.id)
                }]

                return (
                    <OptionMenu options={[
                        {
                            type: "button",
                            label: __('Edit', 'gameengine'),
                            icon: <Icon as={FiEdit} />,
                            onClick: () => navigate(`${route_path}admin.php?page=gameengine-levels&action=edit&id=${row.id}`)
                        },
                        ...trashAction,
                    ]} />
                )
            },
            cell: (row) => (
                <OptionMenu options={[
                    {
                        type: "button",
                        label: __('Edit', 'gameengine'),
                        icon: <Icon as={FiEdit} />,
                        onClick: () => navigate(`${route_path}admin.php?page=gameengine-levels&action=edit&id=${row.id}`)
                    },
                    {
                        type: "button", 
                        suffix: "trash",
                        label: __('Delete', 'gameengine'),
                        icon: <Icon as={FiTrash2} />,
                        onClick: () => { if (confirm('Delete level?')) dispatch(deleteLevel(row.id)); }
                    },
                ]} />
            ),
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


    const importHandler = async () => {
        await API.post(namespace + 'setup/import-module', {
            module: "levels"
        });
        await dispatch(fetchLevels({}));
    }
    const [banners, setBanners] = useState(
        window.GameEngineGlobal.banners
    );
    const closeHandler = async () => {
        await API.post(namespace + 'setup/dismiss-banner', {
            module: "levels"
        });
        setBanners(prev => ({
            ...prev,
            levels: 'yes',
        }));
    }

    const bulkOptions =
            tableStats === 'trash'
              ? [
                  { value: 'restore', label: __('Restore', 'gameengine') },
                  { value: 'delete', label: __('Delete Permanently', 'gameengine') },
                ]
              : [{ value: 'trash', label: __('Move to Trash', 'gameengine') }];
        
    const applyBulkActionHandler = (rows, action) => {
        if (!rows.length) return;
        let message = '';
        if (action.value === 'trash') {
            message = __('Move selected items to trash?', 'gameengine');
            setOriginalStages((prev) => {
            const updates = {};
            rows.forEach((row) => {
                if (row.status !== 'trash' && !(row.id in prev)) {
                    updates[row.id] = row.status || 'pending'; 
                }
            });
            return { ...prev, ...updates };
        });
        } else if (action.value === 'restore') {
            message = __('Restore selected items?', 'gameengine');
        } else if (action.value === 'delete') {
            message = __('Delete permanently? This cannot be undone.', 'gameengine');
        }
        setActionSelected({
            value: true,
            type: action.value,
            message,
        });
    };
            
    const confirmBulkHandler = async () => {
        if (!selectedRows.length || !actionSelected.type) return;
        try {
            for (const row of selectedRows) {
                if (actionSelected.type === 'trash') {
                    await dispatch(
                        updateLevel({
                            id: row.id,
                            payload: { ...row, status: 'trash' } 
                        })
                    );
                } 
                else if (actionSelected.type === 'restore') {
                    const prevStage = originalStages[row.id] || 'publish';

                    await dispatch(
                        updateLevel({
                            id: row.id,
                            payload: { ...row, status: prevStage }
                        })
                    );
                    setOriginalStages((prev) => {
                        const next = { ...prev };
                        delete next[row.id];
                        return next;
                    });
                } 
                else if (actionSelected.type === 'delete') {
                    await dispatch(deleteLevel(row.id));
                    setOriginalStages((prev) => {
                        const next = { ...prev };
                        delete next[row.id];
                        return next;
                    });
                }
            }
            setSelectedRows([]);
            setActionSelected({ value: false });
            fetchHandler({ status: tableStats, page, per_page: perPage });
        } catch (err) {
            console.error('Bulk action failed:', err);
        }
    };
    
    const snackbarActionButtons = bulkOptions.map((opt) => {
        let btnClass = '';
        if (opt.value === 'restore') btnClass = 'gameengine-btn--restore';
        if (opt.value === 'delete') btnClass = 'gameengine-btn--delete';
        if (opt.value === 'trash') btnClass = 'gameengine-btn--trash';
        return {
            label: opt.label,
            onClick: () => applyBulkActionHandler(selectedRows, opt),
            className: btnClass,
        };
    });

    return (
        <div className='gameengine-page-content'>
            {(levels.length === 0 && banners?.levels !== 'yes' && tableStats === 'all') && (
                <ImportDemoBanner
                    title={__("No levels found.", 'gameengine')}
                    subtitle={__("Want to quickly get started by importing a default levels currency and login rewards?", 'gameengine')}
                    handleImport={importHandler}
                    handleClose={closeHandler}
                />
            )}
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Levels", "gameengine")} />

                <Button
                    {...primaryBtn}
                    onClick={() => navigate(`${route_path}admin.php?page=gameengine-levels&action=new`)}
                >
                    <Icon as={GoPlus} boxSize="20px" /> {__('Add new level', 'gameengine')}
                </Button>
            </Flex>

            <ListTable
                columns={columns}
                data={levels}
                noDataText={__("No data found for levels", "gameengine")}
                dataFetchingStatus={loading}
                isRowSelectable={true}
                showPagination={false}
                showColumnFilter={false}
                showSubHeader={true}
                subHeaderComponent={subHeaderComponentMemo}
                totalItems={total}
                totalRows={levels.length}
                // resetSelected={resetSelectedItems}
                rowsPerPage={perPage}
                currentPageNumber={[page]}
                getSelectRowValue={setSelectedRows}
            />

            <SnackbarAction
                itemsLength={selectedRows.length}
                actionButtons={snackbarActionButtons}
                isActionSelected={actionSelected}
                confirmHandler={confirmBulkHandler}
                resetHandler={() => {
                    setSelectedRows([]);
                    setActionSelected({ value: false });
                }}
            />
        </div>
    );
};

export default LevelTable;
