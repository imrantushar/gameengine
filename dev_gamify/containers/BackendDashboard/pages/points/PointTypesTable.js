import { Flex, Icon, Spinner } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import { fetchPointTypes ,deletePointType} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PointTypesTable = () => {
  const { pointTypes, listStatus } = useSelector((state) => state.pointType);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
      dispatch(fetchPointTypes());
  }, []);
  
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
    </>
  );
};

export default PointTypesTable;