import BoxView from '@GFComponents/BoxView/BoxView';
import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import { fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';
import OptionMenu from '@GFComponents/OptionMenu';
import { Box, Icon } from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const TypesTable = ({type, editHandler}) => {
  const dispatch = useDispatch();
  const {types: {data: achivementTypes}} = useSelector(state => state.achievements);
  const {types: {data: levelTypes}} = useSelector(state => state.levels);
  const data = type === "achievement" ? achivementTypes : levelTypes;
  const [loading, setLoading] = useState(data.length === 0);

  useEffect(() => {
    (async() => {
      setLoading(true)
      try {
        if(type === "achievement") {
          await dispatch(fetchAchievementTypes())
        } 
        if(type === "level") {
          await dispatch(fetchLevelTypes())
        }
      } catch (error) {
        console.warn(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [type])

  const columns = [
    {
        name: __('Name', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{row?.name}</Box>
    },
    {
        name: __('Slug', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{row?.slug}</Box>
    },
    {
        name: __('Description', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{row?.description}</Box>
    },
    {
        name: __('Count', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{row?.count}</Box>
    },
    {
        name: __('Parent', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{row.parent}</Box>
    },
    {
        name: __('Action', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => {
          return (
            <OptionMenu
              options={[
                {
                    type: 'button',
                    label: __('Edit', 'gamify'),
                    icon: <Icon as={FiEdit} />,
                    onClick: () => editHandler(row)
                },
                {
                    type: 'button',
                    suffix: 'trash',
                    label: __('Delete', 'gamify'),
                    icon: <Icon as={FiTrash2} />,
                    // onClick: () => handleDelete(row?.id)
                },
              ]}
            />
          )
        }
    },
  ];
  
  return (
    <BoxView width='65%'>
      <ListTable
        key={`${type}-table-`+ data?.length}
        columns={columns}
        data={data}
        showSubHeader={false}
        showColumnFilter={false}
        isRowSelectable={false}
        dataFetchingStatus={loading}
        showPagination={false}
        noDataText={sprintf(__("No data found for %s types", "gamify"), type)}
        suffix={type + "-table"}
      />
    </BoxView>
  );
};

export default TypesTable;