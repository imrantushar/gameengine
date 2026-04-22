import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAchievementType, fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import { deleteLevelType, fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';
import OptionMenu from '@GFComponents/OptionMenu';
import { Icon } from '@GFUtils/ui';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { sliceString } from '@GFUtils/helper';
import Tooltip from '@GFComponents/Tooltip';
import { LuInfo } from 'react-icons/lu';
const TypesTable = ({
  type,
  editHandler
}) => {
  const dispatch = useDispatch();
  const {
    types: {
      data: achivementTypes
    }
  } = useSelector(state => state.achievements);
  const {
    types: {
      data: levelTypes
    }
  } = useSelector(state => state.levels);
  const data = type === "achievement" ? achivementTypes : levelTypes;
  const [loading, setLoading] = useState(data.length === 0);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (type === "achievement") {
          await dispatch(fetchAchievementTypes());
        }
        if (type === "level") {
          await dispatch(fetchLevelTypes());
        }
      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [type]);
  const deleteHandler = row => {
    if (type === "achievement") {
      dispatch(deleteAchievementType(row.id));
    }
    if (type === "level") {
      dispatch(deleteLevelType(row.id));
    }
  };
  const columns = [{
    name: __('Name', 'gameengine'),
    textAlign: "start",
    cell: (row = {}) => <>
          {row?.description ? <div className="flex items-center gap-2">
              <GFLabel type='basic' label={sliceString(row?.name, 30)} margin={0} />
              <Tooltip content={row?.description}><LuInfo /></Tooltip>
            </div> : <GFLabel type='basic' label={sliceString(row?.name, 30)} margin={0} />}
        </>,
    textAlign: "start",
    columnWidth: "30%"
  }, {
    name: __('Slug', 'gameengine'),
    cell: (row = {}) => <>{sliceString(row?.slug, 30)}</>,
    columnWidth: "30%"
  },
  // {
  //     name: __('Description', 'gameengine'),
  //     columnWidth: "180px",
  //     textAlign: "start",
  //     cell: (row = {}) => <Box>{row?.description}</Box>
  // },
  // {
  //     name: __('Count', 'gameengine'),
  //     columnWidth: "180px",
  //     textAlign: "start",
  //     cell: (row = {}) => <Box>{row?.count}</Box>
  // },
  {
    name: __('Parent', 'gameengine'),
    cell: (row = {}) => {
      let parentItem = {};
      parentItem = data.find(item => Number(item.id) === Number(row.parent));
      if (!parentItem) {
        return "...";
      }
      return <>{parentItem?.name}</>;
    },
    columnWidth: "30%"
  }, {
    name: __('Action', 'gameengine'),
    cell: (row = {}) => {
      return <OptionMenu options={[{
        type: 'button',
        label: __('Edit', 'gameengine'),
        icon: <Icon as={FiEdit} />,
        onClick: () => editHandler(row)
      }, {
        type: 'button',
        suffix: 'trash',
        label: __('Delete', 'gameengine'),
        icon: <Icon as={FiTrash2} />,
        onClick: () => deleteHandler(row)
      }]} />;
    },
    textAlign: "end",
    columnWidth: "10%"
  }];
  return <div style={{
    "width": "70%"
  }}>
      <ListTable key={`${type}-table-` + data?.length} columns={columns} data={data} showSubHeader={false} showColumnFilter={false} isRowSelectable={false} dataFetchingStatus={loading} showPagination={false} noDataText={sprintf(
    // translators: %s. Table data type name.
    __("No data found for %s types", "gameengine"), type)} suffix={type + "-table"} />
    </div>;
};
export default TypesTable;