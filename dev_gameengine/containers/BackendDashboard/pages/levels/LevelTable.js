import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import Button from '@GFComponents/Button';
import {
  API,
  namespace,
  route_path,
  statusArray,
  tableStatusArray
} from '@GFUtils/helper';
import {
  fetchLevels,
  deleteLevel,
  updateLevel
} from '../../../../redux/Slices/levelsSlice/levelsSlice';
import { GoPlus } from 'react-icons/go';
import { fetchLevelTypes } from '@GFRedux/Slices/levelsSlice/types';
import moment from 'moment';
import StatusOptions from '@GFComponents/StatusOptions';
import Search from '@GFComponents/Search';
import ImportDemoBanner from '@GFComponents/ImportDemoBanner';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';
const LevelTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    levels = [],
    types,
    page,
    perPage,
    total,
    search
  } = useSelector(state => state.levels || {});

  const [loading, setLoading] = useState(levels.length === 0);
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
      setLoading(true);

      await dispatch(fetchLevels({
        status,
        page,
        per_page,
        search: searchKey
      }));
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (types.data?.length === 0) {
      dispatch(fetchLevelTypes());
    }

    if (!levels || (levels && levels.length <= 1)) {
      fetchHandler({
        status: tableStats,
        page,
        per_page: perPage
      });
    }
  }, []);

  const columns = [
    {
      name: __('Name', 'gameengine'),
      cell: row => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() =>
            navigate(
              `${route_path}admin.php?page=gameengine-levels&path=levels-types&id=${row.id}`
            )
          }
        >
          {row.icon && (
            <img
              src={row.icon}
              alt=""
              className="w-6 h-6 object-contain"
            />
          )}
          <span className="font-medium">{row.title}</span>
        </div>
      )
    },
    {
      name: __('Category', 'gameengine'),
      cell: (row = {}) => {
        const category = types.data.find(
          item => Number(row?.category_id) === Number(item.id)
        );

        if (!category) {
          return (
            <span className="text-xs" style={{ color: '#999' }}>
              -
            </span>
          );
        }

        return (
          <span className="rounded pl-2 pr-2">
            {category?.name}
          </span>
        );
      }
    },
    {
      name: __('Unlock Criteria', 'gameengine'),
      cell: row =>
        parseInt(row.unlock_with_points_enabled)
          ? `${row.min_points} - ${row.max_points} Points`
          : 'Triggers'
    },
    {
      name: __('Date', 'gameengine'),
      cell: row => (
        <span className="text-sm">{moment(row?.created_at).format('MMMM DD, YYYY')}</span>
      )
    },
    {
      name: __('Status', 'gameengine'),
      cell: row => {
        const statusUpdateHandler = itemStatus => {
          const updatedData = {
            ...row,
            status: itemStatus
          };

          dispatch(
            updateLevel({
              id: row.id,
              payload: updatedData
            })
          );
        };

        return (
          <StatusOptions
            value={row?.status}
            options={{ items: [...statusArray] }}
            onChangeHandler={statusUpdateHandler}
          />
        );
      },
      width: "15%"
    },
    {
      cell: row => (
        <OptionMenu
          options={[
            {
              type: "button",
              label: __('Edit', 'gameengine'),
              icon: <FiEdit />,
              onClick: () =>
                navigate(
                  `${route_path}admin.php?page=gameengine-levels&action=edit&id=${row.id}`
                ),
              hasBorder: true
            },
            {
              type: "button",
              suffix: "trash",
              label: __('Delete', 'gameengine'),
              icon: <FiTrash2 />,
              onClick: () => {
                if (window.confirm(__('Are you sure?', 'gameengine'))) {
                  dispatch(deleteLevel(row.id));
                }
              }
            }
          ]}
        />
      )
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
                className={`gameengine-filter-toolbar__tab !text-sm font-medium transition-all${isActive ? ' is-active' : ''
                  }`}
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

        <div className="gameengine-table-subheader-right pb-2">
          <Search
            placeholder="Search levels"
            onSearchHandler={searchHandler}
            defaultValue={search ? search : ''}
          />
        </div>
      </div>
    );
  }, [tableStats, search]);

  const importHandler = async () => {
    await API.post(namespace + 'setup/import-module', {
      module: "levels"
    });

    await dispatch(fetchLevels({}));
  };

  const [banners, setBanners] = useState(
    window.GameEngineGlobal.banners
  );

  const closeHandler = async () => {
    await API.post(namespace + 'setup/dismiss-banner', {
      module: "levels"
    });

    setBanners(prev => ({
      ...prev,
      levels: 'yes'
    }));
  };

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
            updates[row.id] = row.status || 'pending';
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
    if (!selectedRows.length || !actionSelected.type) return;

    try {
      for (const row of selectedRows) {
        if (actionSelected.type === 'trash') {
          await dispatch(
            updateLevel({
              id: row.id,
              payload: {
                ...row,
                status: 'trash'
              }
            })
          );
        } else if (actionSelected.type === 'restore') {
          const prevStage =
            originalStages[row.id] || 'publish';

          await dispatch(
            updateLevel({
              id: row.id,
              payload: {
                ...row,
                status: prevStage
              }
            })
          );

          setOriginalStages(prev => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
        } else if (actionSelected.type === 'delete') {
          await dispatch(deleteLevel(row.id));

          setOriginalStages(prev => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
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
      console.error('Bulk action failed:', err);
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
    <div className="gameengine-page-content">
      {levels.length === 0 &&
        banners?.levels !== 'yes' &&
        tableStats === 'all' && (
          <ImportDemoBanner
            title={__("No levels found.", 'gameengine')}
            subtitle={__("Want to quickly get started by importing a default levels currency and login rewards?", 'gameengine')}
            handleImport={importHandler}
            handleClose={closeHandler}
          />
        )}

      <div className="flex justify-between items-center py-6 px-1">
        <h2 className="gameengine-page-heading">
          {__("Levels", "gameengine")}
        </h2>

        <Button
          label={__('Add new level', 'gameengine')}
          icon={<GoPlus size="16px" />}
          onClick={() => navigate(`${route_path}admin.php?page=gameengine-levels&action=new`)}
        />
      </div>

      <ListTable
        columns={columns}
        data={levels}
        noDataText={__("No data found for levels", "gameengine")}
        dataFetchingStatus={loading}
        isRowSelectable={true}
        showPagination={false}
        showColumnFilter={false}
        showSubHeader={true}
        subHeaderComponent={subHeaderComponentMemo}
        totalItems={total}
        totalRows={levels.length}
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
    </div>
  );
};

export default LevelTable;
