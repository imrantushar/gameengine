import React, { useEffect } from 'react';
import { Flex, Icon } from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import { fetchPointTypes, deletePointType } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { route_path } from '@GFUtils/helper';

const PointTypesTable = () => {
  const { pointTypes, listStatus } = useSelector((state) => state.pointType);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  useEffect(() => {
    if (!action) {
      dispatch(fetchPointTypes());
    }
  }, [action, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm(__('Are you sure?', "gameengine"))) {
      dispatch(deletePointType(id));
    }
  };

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
