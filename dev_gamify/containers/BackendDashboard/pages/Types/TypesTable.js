import BoxView from '@GFComponents/BoxView/BoxView';
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';

const TypesTable = ({type}) => {
  const data = []
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
  
  return (
    <BoxView width='65%'>
      <ListTable
        key={`${type}-table-`+ data?.length}
        columns={columns}
        data={data ?? []}
        showSubHeader={false}
        showColumnFilter={false}
        isRowSelectable={false}
        // dataFetchingStatus={loading}
          showPagination={true}
          noDataText={sprintf(__("No data found for %s types", "gamify"), type)}
        suffix={type + "-table"}
    />
    </BoxView>
  );
};

export default TypesTable;