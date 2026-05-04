import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Icon } from '@GFComponents/UI';
import OptionMenu from '@GFComponents/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import {
  deleteAchievement,
  fetchAchievements,
  updateAchievement
} from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import {
  API,
  namespace,
  route_path,
  statusArray,
  tableStatusArray
} from '@GFUtils/helper';
import { GoPlus } from 'react-icons/go';
import { fetchAchievementTypes } from '@GFRedux/Slices/achivementSlice/types';
import moment from 'moment';
import Search from '@GFComponents/Search';
import StatusOptions from '@GFComponents/StatusOptions';
import ImportDemoBanner from '@GFComponents/ImportDemoBanner';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';

const AchievementsTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    achievements,
    types,
    page,
    perPage,
    total,
    search
  } = useSelector(state => state.achievements);

  const [loading, setLoading] = useState(achievements.length === 0);
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

      await dispatch(fetchAchievements({
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
      dispatch(fetchAchievementTypes());
    }

    if (!achievements || (achievements && achievements.length <= 1)) {
      fetchHandler({
        status: tableStats,
        page,
        per_page: perPage
      });
    }
  }, []);

  const handleDelete = id => {
    if (confirm(__('Are you sure?', 'gameengine'))) {
      dispatch(deleteAchievement(id));
    }
  };

  const columns = [
    {
      name: __('Name', 'gameengine'),
      cell: (row = {}) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() =>
            navigate(
              `${route_path}admin.php?page=gameengine-achievements&action=edit&id=${row?.id}`
            )
          }
        >
          {row?.badge_image && (
            <img
              src={row?.badge_image}
              alt=""
              className="w-6 h-6 object-contain"
            />
          )}
          <span className="font-medium">{row?.title}</span>
        </div>
      ),
      columnWidth: "180px"
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
      name: __('Date', 'gameengine'),
      cell: row => (
        <div>
          <p className="m-0">
            {moment(row?.created_at).format('MMMM DD, YYYY')}
          </p>
        </div>
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
            updateAchievement({
              id: row.id,
              data: updatedData
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
      name: __('Action', 'gameengine'),
      cell: (row = {}) => {
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
                      updateAchievement({
                        id: row.id,
                        data: {
                          ...row,
                          status: 'trash'
                        }
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
                    `${route_path}admin.php?page=gameengine-achievements&action=edit&id=${row?.id}`
                  ),
                hasBorder: true
              },
              ...trashAction
            ]}
          />
        );
      }
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
                className={`gameengine-filter-toolbar__tab !text-sm font-medium transition-all${
                  isActive ? ' is-active' : ''
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
            placeholder="Search question"
            onSearchHandler={searchHandler}
            defaultValue={search ? search : ''}
          />
        </div>
      </div>
    );
  }, [tableStats, search]);

  const importHandler = async () => {
    await API.post(namespace + 'setup/import-module', {
      module: "achievements"
    });

    await dispatch(fetchAchievements({}));
  };

  const [banners, setBanners] = useState(
    window.GameEngineGlobal.banners
  );

  const closeHandler = async () => {
    await API.post(namespace + 'setup/dismiss-banner', {
      module: "achievements"
    });

    setBanners(prev => ({
      ...prev,
      achievements: 'yes'
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
          if (!(row.id in prev)) {
            updates[row.id] = row.status;
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
    if (!selectedRows.length) return;

    try {
      for (const row of selectedRows) {
        if (actionSelected.type === 'trash') {
          await dispatch(
            updateAchievement({
              id: row.id,
              data: {
                ...row,
                status: 'trash'
              }
            })
          );
        } else if (actionSelected.type === 'restore') {
          const previousStatus =
            originalStages[row.id] || 'pending';

          await dispatch(
            updateAchievement({
              id: row.id,
              data: {
                ...row,
                status: previousStatus
              }
            })
          );

          setOriginalStages(prev => {
            const copy = { ...prev };
            delete copy[row.id];
            return copy;
          });
        } else if (actionSelected.type === 'delete') {
          await dispatch(deleteAchievement(row.id));

          setOriginalStages(prev => {
            const copy = { ...prev };
            delete copy[row.id];
            return copy;
          });
        }
      }

      setSelectedRows([]);
      setActionSelected({
        value: false,
        type: '',
        message: ''
      });

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
    <div className='gameengine-page-content'>
      {achievements.length === 0 &&
        banners?.achievements !== 'yes' &&
        tableStats === 'all' && (
          <ImportDemoBanner
            title={__("No achievements found.", 'gameengine')}
            subtitle={__("Want to quickly get started by importing a default achievements currency and login rewards?", 'gameengine')}
            handleImport={importHandler}
            handleClose={closeHandler}
          />
        )}

      <div className="flex justify-between items-center py-6 px-1">
        <h2 className="text-xl md:text-2xl font-[500] text-gray-800 m-0">
          {__("Achievements", "gameengine")}
        </h2>

        <button
          style={primaryBtn}
          className="flex items-center gap-2 text-sm shadow-sm font-medium transition-colors cursor-pointer"
          onClick={() =>
            navigate(
              `${route_path}admin.php?page=gameengine-achievements&action=new`
            )
          }
        >
          <Icon as={GoPlus} color={'#fff'} className="text-lg font-bold" />
          {__('Add new achievement', 'gameengine')}
        </button>
      </div>

      <ListTable
        key={'acievements-table-' + achievements?.length}
        columns={columns}
        data={achievements}
        showSubHeader={true}
        showColumnFilter={false}
        isRowSelectable={true}
        showPagination={false}
        noDataText={__("No data found for Achievements", "gameengine")}
        suffix="achievements-table"
        subHeaderComponent={subHeaderComponentMemo}
        totalItems={total}
        totalRows={achievements.length}
        dataFetchingStatus={loading}
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

export default AchievementsTable;
