import BoxView from '@GFComponents/BoxView/BoxView';
import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAchievementType, fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import { deleteLevelType, fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';
import OptionMenu from '@GFComponents/OptionMenu';
import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { clearBtn } from '../../../../../assets/scss/chakra/recipe';
import { sliceString } from '@GFUtils/helper';

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

  const deleteHandler = (row) => {
    if(type === "achievement") {
      dispatch(deleteAchievementType(row.id))
    }
    if(type === "level") {
      dispatch(deleteLevelType(row.id))
    }
  }

  const columns = [
    {
        name: __('Name', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => (
          <Box>
            <GFLabel type='basic' label={sliceString(row?.name, 30)} margin={0} />
            <Flex gap={'8px'}>
              <GFLabel type='simple' label={__("ID:", "gamify") + " " + row?.id} />
              <Flex gap={'4px'}>
                <Button
                  {...clearBtn}
                  minW={'16px'}
                  height={'16px'}
                  onClick={() => editHandler(row)}
                  >
                  <Icon as={FiEdit} width={'14px'} />
                </Button>
                <Button
                  {...clearBtn}
                  height={'16px'}
                  minW={'16px'}
                  onClick={() => deleteHandler(row)}
                >
                  <Icon as={FiTrash2} width={'14px'} color={'red'} />
                </Button>
              </Flex>
            </Flex>
          </Box>
        )
    },
    {
        name: __('Slug', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
        cell: (row = {}) => <Box>{sliceString(row?.slug, 30)}</Box>
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
                    onClick: () => deleteHandler(row)
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