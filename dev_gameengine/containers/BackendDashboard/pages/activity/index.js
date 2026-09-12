import React, { useEffect, useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import TopBar from '@GFComponents/TopBar';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import GetHelp from '@GFComponents/GetHelp';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { API, namespace, relativeTime } from '@GFUtils/helper';

/**
 * The kinds NotificationManager writes. Kept in step with
 * NotificationsController::TYPES — anything else is not a real filter.
 */
const TYPE_META = {
    points: { label: __('Points', 'gameengine'), icon: '🪙' },
    achievement: { label: __('Achievement', 'gameengine'), icon: '🏆' },
    level: { label: __('Level', 'gameengine'), icon: '⬆️' },
};


const Activity = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [type, setType] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const params = new URLSearchParams({ page, per_page: perPage });
        if (type) params.append('type', type.value);
        if (search) params.append('search', search);

        API.get(`${namespace}notifications/admin-feed?${params.toString()}`)
            .then((res) => {
                if (cancelled) return;
                setItems(res.data || []);
                setTotal(parseInt(res.headers['x-wp-total'] || '0', 10));
            })
            .catch(() => {
                if (!cancelled) {
                    setItems([]);
                    setTotal(0);
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [page, perPage, type, search]);

    const typeOptions = useMemo(
        () => Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label })),
        []
    );

    const columns = useMemo(() => [
        {
            name: __('Member', 'gameengine'),
            cell: (row) => (
                <span className="font-semibold">
                    {row.display_name || __('Unknown', 'gameengine')}
                </span>
            ),
            columnWidth: '180px',
        },
        {
            name: __('Activity', 'gameengine'),
            cell: (row) => (
                <span className="flex items-center gap-2">
                    <span style={{ fontSize: '15px', lineHeight: 1 }}>
                        {(TYPE_META[row.type] || {}).icon || '🔔'}
                    </span>
                    <span title={row.message}>{row.message}</span>
                </span>
            ),
            columnWidth: '420px',
        },
        {
            name: __('Type', 'gameengine'),
            cell: (row) => (
                <span className="text-xs text-[var(--gameengine-warn-muted)]">
                    {(TYPE_META[row.type] || {}).label || row.type}
                </span>
            ),
            columnWidth: '120px',
        },
        {
            name: __('When', 'gameengine'),
            cell: (row) => (
                <span
                    className="text-sm"
                    title={new Date(row.created_at).toLocaleString()}
                >
                    {relativeTime(row.created_at)}
                </span>
            ),
            columnWidth: '140px',
        },
    ], []);

    const subHeaderComponentMemo = useMemo(() => (
        <>
            <div className="flex items-center gap-3">
                <GFLabel
                    color="var(--gameengine-font-color)"
                    fontWeight="700"
                    fontSize="16px"
                    label={__('Activity', 'gameengine')}
                />

                <div style={{ minWidth: '200px' }}>
                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        placeholder={__('All types', 'gameengine')}
                        options={typeOptions}
                        value={type}
                        isClearable
                        onChange={(opt) => { setType(opt); setPage(1); }}
                    />
                </div>
            </div>

            <Search
                placeholder={__('Search member or message', 'gameengine')}
                defaultValue={search}
                onSearchHandler={(val) => { setSearch(val); setPage(1); }}
            />
        </>
        // `search` is deliberately absent: Search owns its own input state, and
        // re-mounting it on every keystroke would drop focus mid-typing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [type, typeOptions]);

    return (
        <>
            <TopBar
                path={__('Activity', 'gameengine')}
                rightContent={<GetHelp filterText={['activity', 'logs']} />}
            />

            <div className="gameengine-page-content">
                <div className="flex justify-between items-center py-6 px-1">
                    <div>
                        <h2 className="gameengine-page-heading">
                            {__('Platform Activity', 'gameengine')}
                        </h2>
                        <p className="text-xs m-0 mt-1 text-[var(--gameengine-warn-muted)]">
                            {__('Every points change, achievement and level-up sent to your members.', 'gameengine')}
                        </p>
                    </div>
                </div>

                <ListTable
                    columns={columns}
                    data={items}
                    isRowSelectable={false}
                    showSubHeader={true}
                    subHeaderComponent={subHeaderComponentMemo}
                    showColumnFilter={false}
                    showPagination={true}
                    noDataText={__('No activity yet.', 'gameengine')}
                    totalItems={total}
                    currentPageNumber={page}
                    rowsPerPage={perPage}
                    onChangePage={(p) => setPage(p)}
                    onChangeItemsPerPage={(n) => { setPerPage(n); setPage(1); }}
                    dataFetchingStatus={loading}
                    suffix="activity-table"
                />
            </div>
        </>
    );
};

export default Activity;
