import React, { useEffect, useMemo, useState } from 'react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import {
  fetchPointTypes,
  deletePointType,
  fetchTriggers,
  updatePointType
} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { route_path, statusArray, tableStatusArray } from '@GFUtils/helper';
import moment from 'moment';
import StatusOptions from '@GFComponents/StatusOptions';
import Search from '@GFComponents/Search';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';

const PointTypesTable = () => {
  const {
    pointTypes,
    listStatus,
    allHooks,
    page,
    perPage,
    total,
    search
  } = useSelector(state => state.pointType);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const [tableStats, setTableStatus] = useState('all');
  const [actionSelected, setActionSelected] = useState({
    value: false,
    type: '',
    message: ''
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [originalStages, setOriginalStages] = useState({});

  const fetchHandler = async ({
    status = 'all',
    page = 1,
    per_page = 15,
    searchKey = ""
  }) => {
    try {
      await dispatch(fetchPointTypes({
        status,
        page,
        per_page,
        search: searchKey
      }));
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    if (!action) {
      dispatch(fetchTriggers());

      if (!pointTypes || (pointTypes && pointTypes.length <= 1)) {
        fetchHandler({
          status: tableStats,
          page,
          per_page: perPage
        });
      }
    }
  }, [action]);

  const handleDelete = id => {
    if (window.confirm(__('Are you sure?', "gameengine"))) {
      dispatch(deletePointType(id));
    }
  };

  const renderAction = (row, type) => {
    let actionsArry = row.requirements
      .filter(item => item.action_type === type)
      .map(item => item.trigger_key);

    actionsArry = allHooks
      .map(item => actionsArry.includes(item.id) ? item : false)
      .filter(Boolean)
      .map(item => item.label);

    return actionsArry;
  };

  const columns = [
    {
      name: __('Name', 'gameengine'),
      cell: row => (
        <>
          <span
            className="cursor-pointer"
            onClick={() =>
              navigate(
                `${route_path}admin.php?page=gameengine-points&action=edit&id=${row?.id}&path=name`
              )
            }
          >
            {row?.name}
          </span>
        </>
      ),
      columnWidth: "20%"
    },
    {
      name: __('Award Actions', 'gameengine'),
      cell: row => {
        const itemArray = renderAction(row, 'award');

        if (itemArray.length === 0) {
          return (
            <span className="text-xs" style={{ color: '#999' }}>
              --
            </span>
          );
        }

        return (
          <div className="flex flex-wrap justify-center items-center gap-1">
            {itemArray.length + " " + __('Actions.', 'gameengine')}
          </div>
        );
      },
      columnWidth: "23%"
    },
    {
      name: __('Deduct Actions', 'gameengine'),
      cell: row => {
        const itemArray = renderAction(row, 'deduct');

        if (itemArray.length === 0) {
          return (
            <span className="text-xs" style={{ color: '#999' }}>
              -
            </span>
          );
        }

        return (
          <div className="flex flex-wrap justify-center items-center gap-1">
            {itemArray.length + " " + __('Actions.', 'gameengine')}
          </div>
        );
      },
      columnWidth: "23%"
    },
    {
      name: __('Date', 'gameengine'),
      cell: row => (
        <div>
          <p className="m-0">
            {moment(row?.created_at).format('MMMM DD, YYYY')}
          </p>
        </div>
      ),
      columnWidth: "10%"
    },
    {
      name: __('Status', 'gameengine'),
      cell: row => {
        const statusUpdateHandler = itemStatus => {
          const updatedData = {
            ...row,
            status: itemStatus
          };

          dispatch(updatePointType({
            id: row.id,
            data: updatedData
          }));
        };

        return (
          <StatusOptions
            value={row?.status}
            options={{ items: [...statusArray] }}
            onChangeHandler={statusUpdateHandler}
          />
        );
      },
      columnWidth: "14%"
    },
    {
      name: __('Action', 'gameengine'),
      cell: row => {
        const trashAction =
          tableStats !== 'trash'
            ? [
                {
                  type: 'button',
                  suffix: 'trash',
                  label: __('Trash', 'gameengine'),
                  icon: <FiTrash2 />,
                  onClick: () =>
                    dispatch(
                      updatePointType({
                        id: row.id,
                        ...row,
                        status: 'trash'
                      })
                    )
                }
              ]
            : [
                {
                  type: 'button',
                  suffix: 'trash',
                  label: __('Delete', 'gameengine'),
                  icon: <FiTrash2 />,
                  onClick: () => handleDelete(row?.id)
                }
              ];

        return (
          <OptionMenu
            options={[
              {
                type: 'button',
                label: __('Edit', 'gameengine'),
                icon: <FiEdit />,
                onClick: () =>
                  navigate(
                    `${route_path}admin.php?page=gameengine-points&action=edit&id=${row?.id}&path=name`
                  ),
                hasBorder: true
              },
              ...trashAction
            ]}
          />
        );
      },
      columnWidth: "10%"
    }
  ];

  const subHeaderComponentMemo = useMemo(() => {
    const searchHandler = (value = "") => {
      fetchHandler({
        status: tableStats,
        page,
        per_page: perPage,
        searchKey: value
      });
    };

    return (
      <div className="gameengine-filter-toolbar flex justify-between items-center w-full border-0 border-b border-solid border-gray-200 mb-4">
        <div className="gameengine-filter-toolbar__tabs flex">
          {tableStatusArray.map((item, index) => {
            const isActive = tableStats === item.value;

            return (
              <button
                key={index}
                className={`gameengine-filter-toolbar__tab !text-sm font-medium transition-all${isActive ? ' is-active' : ''}`}
                onClick={() => {
                  setTableStatus(item.value);

                  fetchHandler({
                    status: item.value,
                    page: 1,
                    per_page: 15
                  });
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className='gameengine-table-subheader-right pb-2'>
          <Search
            placeholder='Search question'
            onSearchHandler={searchHandler}
            defaultValue={search ? search : ''}
          />
        </div>
      </div>
    );
  }, [tableStats, search]);

  const bulkOptions =
    tableStats === 'trash'
      ? [
          {
            value: 'restore',
            label: __('Restore', 'gameengine')
          },
          {
            value: 'delete',
            label: __('Delete Permanently', 'gameengine')
          }
        ]
      : [
          {
            value: 'trash',
            label: __('Move to Trash', 'gameengine')
          }
        ];

  const applyBulkActionHandler = (rows, action) => {
    if (!rows.length) return;

    let message = '';

    if (action.value === 'trash') {
      message = __('Move selected items to trash?', 'gameengine');

      setOriginalStages(prev => {
        const updates = {};

        rows.forEach(row => {
          if (row.status !== 'trash' && !(row.id in prev)) {
            updates[row.id] = row.status || 'publish';
          }
        });

        return {
          ...prev,
          ...updates
        };
      });
    } else if (action.value === 'restore') {
      message = __('Restore selected items?', 'gameengine');
    } else if (action.value === 'delete') {
      message = __('Delete permanently? This cannot be undone.', 'gameengine');
    }

    setActionSelected({
      value: true,
      type: action.value,
      message
    });
  };

  const confirmBulkHandler = async () => {
    try {
      if (!selectedRows.length) return;

      for (const row of selectedRows) {
        if (actionSelected.type === 'trash') {
          await dispatch(updatePointType({
            id: row.id,
            data: {
              prevStatus: row.status,
              status: 'trash'
            }
          }));
        }

        if (actionSelected.type === 'restore') {
          for (const row of selectedRows) {
            const prevStage = originalStages[row.id] || 'pending';

            await dispatch(updatePointType({
              id: row.id,
              data: {
                status: prevStage
              }
            }));

            setOriginalStages(prev => {
              const copy = { ...prev };
              delete copy[row.id];
              return copy;
            });
          }
        }

        if (actionSelected.type === 'delete') {
          await dispatch(deletePointType(row.id));
        }
      }

      setSelectedRows([]);
      setActionSelected({ value: false });

      fetchHandler({
        status: tableStats,
        page,
        per_page: perPage
      });
    } catch (err) {
      console.error(err);
    }
  };

  const snackbarActionButtons = bulkOptions.map(opt => {
    let btnClass = '';

    if (opt.value === 'restore') btnClass = 'gameengine-btn--restore';
    if (opt.value === 'delete') btnClass = 'gameengine-btn--delete';
    if (opt.value === 'trash') btnClass = 'gameengine-btn--trash';

    return {
      label: opt.label,
      onClick: () => applyBulkActionHandler(selectedRows, opt),
      className: btnClass
    };
  });

  return (
    <>
      <ListTable
        key={'points-type-' + pointTypes.length}
        columns={columns}
        data={pointTypes}
        showColumnFilter={false}
        showSubHeader={true}
        subHeaderComponent={subHeaderComponentMemo}
        isRowSelectable={true}
        showPagination={false}
        noDataText={__("No data found", "gameengine")}
        totalItems={total}
        totalRows={pointTypes.length}
        dataFetchingStatus={listStatus}
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
    </>
  );
};

export default PointTypesTable;
