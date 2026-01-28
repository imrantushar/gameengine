import React, { useEffect } from 'react';
import { Badge, Box, Flex, Icon } from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import { fetchPointTypes, deletePointType, fetchTriggers } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tooltip from "@GFComponents/Tooltip"
import { route_path } from '@GFUtils/helper';
import { LuInfo } from 'react-icons/lu';

const PointTypesTable = () => {
  const { pointTypes, listStatus, allHooks } = useSelector((state) => state.pointType);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  useEffect(() => {
    if (!action) {
      dispatch(fetchTriggers());
      dispatch(fetchPointTypes());
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
      cell: (row) => row?.date,
    },
    {
      name: __('Action', 'gameengine'),
      cell: (row) => (
        <OptionMenu
          options={[
            {
              type: 'button',
              label: __('Edit', 'gameengine'),
              icon: <Icon as={FiEdit} />,
              onClick: () => navigate(`${route_path}admin.php?page=gameengine-points&action=edit&id=${row?.id}&path=name`)
            },
            {
              type: 'button',
              suffix: 'trash',
              label: __('Delete', 'gameengine'),
              icon: <Icon as={FiTrash2} />,
              onClick: () => handleDelete(row?.id)
            },
          ]}
        />
      ),
      textAlign: "end",
    },
  ];

  return (
    <>
      <ListTable
        key={'points-type-'+pointTypes.length}
        columns={columns}
        data={pointTypes}
        showSubHeader={false}
        showColumnFilter={false}
        dataFetchingStatus={listStatus}
        isRowSelectable={false}
        showPagination={false}
        noDataText={__("No data found", "gameengine")}
      />
    </>
  );
};

export default PointTypesTable;
