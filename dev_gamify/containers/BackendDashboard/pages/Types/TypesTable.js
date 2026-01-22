import BoxView from '@GFComponents/BoxView/BoxView';
import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import { fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';

const TypesTable = ({type}) => {
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
    },
    {
        name: __('Slug', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
    },
    {
        name: __('Description', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
    },
    {
        name: __('Count', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
    },
    {
        name: __('Parent', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
    },
    {
        name: __('Action', 'gamify'),
        columnWidth: "180px",
        textAlign: "start",
    },
  ];
  console.log({loading})
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