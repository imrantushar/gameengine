import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import { fetchPointTypes, deletePointType, fetchTriggers, updatePointType } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tooltip from "@GFComponents/Tooltip"
import { route_path, statusArray, tableStatusArray } from '@GFUtils/helper';
import moment from 'moment';
import StatusOptions from '@GFComponents/StatusOptions';
import Search from '@GFComponents/Search';

const PointTypesTable = () => {
  const { pointTypes, listStatus, allHooks, page, perPage, total, search } = useSelector((state) => state.pointType);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const [tableStats, setTableStatus] = useState('all');
  
  const fetchHandler = async ({status = 'all', page = 1, per_page = 15, searchKey = ""}) => {
    try {
      await dispatch(fetchPointTypes({status, page, per_page, search: searchKey}));
    } catch (error) {
      console.warn(error)
    }
  }

  useEffect(() => {
    if (!action) {
      dispatch(fetchTriggers());
      fetchHandler({status: tableStats, page, per_page: perPage})
    }
  }, [action]);

  const handleDelete = (id) => {
    if (window.confirm(__('Are you sure?', "gameengine"))) {
      dispatch(deletePointType(id));
    }
  };

  const renderAction = (row,type) => {
    let actionsArry = row.requirements.filter(item => item.action_type === type).map(item => item.trigger_key);
    actionsArry = allHooks.map(item => actionsArry.includes(item.id) ? item : false).filter(Boolean).map(item => item.label);
    return actionsArry;
  }

  const columns = [
    {
      name: __('Name', 'gameengine'),
      cell: (row) => (
        <>
          <span style={{cursor: "pointer"}} onClick={() => navigate(`${route_path}admin.php?page=gameengine-points&action=edit&id=${row?.id}&path=name`)}>{row?.name}</span>
        </>
      ),
      textAlign: "start",
    },
    {
      name: __('Award Actions', 'gameengine'),
      cell: (row) => {
        const itemArray = renderAction(row, 'award');
        if(itemArray.length === 0 ) return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
        const renderTypeNames = (sliceIndex = 2) => (
          <>
            {itemArray.slice(0,sliceIndex).map((item, idx) => (
              <>
                <Badge variant="subtle" borderRadius="4px" px={2}>
                    {item}
                </Badge>
                {itemArray.slice(0,2).length - 1 !== idx && ','}
              </>
            ))}
          </>
        )
        return (
          <Flex flexWrap={'wrap'} justifyContent={'center'}>
            {renderTypeNames()}
            {itemArray.length > 2 && '...'}
          </Flex>
        );
      },
    },
    {
      name: __('Deduct Actions', 'gameengine'),
      cell: (row) => {
        const itemArray = renderAction(row, 'deduct');
        if(itemArray.length === 0 ) return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
        return (
          <Flex flexWrap={'wrap'} justifyContent={'center'}>
            {itemArray.map((item, idx) => (
              <>
                <Badge variant="subtle" borderRadius="4px" px={2}>
                    {item}
                </Badge>
                {itemArray.length - 1 !== idx && ','}
              </>
            ))}
            {itemArray.length > 2 && '...'}
          </Flex>
        );
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
          dispatch(updatePointType({id:row.id, data: updatedData}))
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
    },
    {
      name: __('Action', 'gameengine'),
      cell: (row) => {
        const trashAction = tableStats !== 'trash' ? [{
                type: 'button',
                suffix: 'trash',
                label: __('Trash', 'gameengine'),
                icon: <Icon as={FiTrash2} />,
                onClick: () => dispatch(updatePointType({id:row.id, ...row, status: 'trash'}))
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
                onClick: () => navigate(`${route_path}admin.php?page=gameengine-points&action=edit&id=${row?.id}&path=name`)
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
    <>
      <ListTable
        key={'points-type-'+pointTypes.length}
        columns={columns}
        data={pointTypes}
        showColumnFilter={false}
        showSubHeader={true}
        subHeaderComponent={subHeaderComponentMemo}
        isRowSelectable={false}
        showPagination={false}
        noDataText={__("No data found", "gameengine")}
        totalItems={total}
        totalRows={pointTypes.length}
        dataFetchingStatus={listStatus}
        // resetSelected={resetSelectedItems}
        rowsPerPage={perPage}
        currentPageNumber={[page]}

      />
    </>
  );
};

export default PointTypesTable;
