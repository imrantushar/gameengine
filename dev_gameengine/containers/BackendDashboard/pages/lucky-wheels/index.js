import React, { useEffect, useState } from 'react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2, FiPlus, FiActivity } from "react-icons/fi";
import { FaRegCopy } from "react-icons/fa6";
import TopBar from '@GFComponents/TopBar';
import OptionMenu from '@GFComponents/OptionMenu';
import Button from '@GFComponents/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { route_path } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import WheelEditor from './WheelEditor';
import WheelAnalytics from './WheelAnalytics';
import GetHelp from '@GFComponents/GetHelp';
import WhatsNew from '@GFComponents/WhatsNew';

export default function LuckyWheels({ action, id }) {
    const [wheels, setWheels] = useState([]);
    const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
    const [analyticsId, setAnalyticsId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const copyShortcode = async (shortcode) => {
        try {
            await navigator.clipboard.writeText(shortcode);
            dispatch(showNotification({
                message: __('Copied', 'gameengine'),
                isShow: true,
                type: 'success',
            }));
        } catch (error) {
            console.error('Error copying shortcode:', error);
        }
    };

    useEffect(() => {
        if (!action) {
            fetchWheels();
        }
    }, [action]);

    const fetchWheels = async () => {
        setDataFetchingStatus(true);
        try {
            const response = await fetch(window.GameEngineGlobal.rest_url + 'gameengine/v1/lucky-wheels', {
                headers: {
                    'X-WP-Nonce': window.GameEngineGlobal.nonce
                }
            });
            const data = await response.json();
            setWheels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching wheels:', error);
        } finally {
            setDataFetchingStatus(false);
        }
    };

    const handleDelete = async (wheelId) => {
        if (!window.confirm(__('Are you sure you want to delete this wheel?', 'gameengine'))) return;
        
        try {
            await fetch(window.GameEngineGlobal.rest_url + `gameengine/v1/lucky-wheels/${wheelId}`, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': window.GameEngineGlobal.nonce
                }
            });
            fetchWheels();
        } catch (error) {
            console.error('Error deleting wheel:', error);
        }
    };

    if (action === 'new' || action === 'edit') {
        return <WheelEditor action={action} id={id} />;
    }

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: row => (
                <span className="font-medium">{row.name || '\u2014'}</span>
            ),
            columnWidth: "25%",
        },
        {
            name: __('Shortcode', 'gameengine'),
            cell: row => {
                const shortcode = `[gameengine_wheel id="${row.id}"]`;
                return (
                    <div className="flex items-center gap-2">
                        <code style={{ background: '#f0f0f0', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>
                            {shortcode}
                        </code>
                        <button
                            type="button"
                            className="gameengine-btn--copy flex items-center justify-center w-[26px] h-[26px] p-0 border-0 bg-transparent cursor-pointer"
                            onClick={() => copyShortcode(shortcode)}
                            title={__('Copy shortcode', 'gameengine')}
                        >
                            <FaRegCopy size={14} />
                        </button>
                    </div>
                );
            },
            columnWidth: "30%",
        },
        {
            name: __('Spin Cost', 'gameengine'),
            cell: row => `${row.spin_cost} Points`,
            columnWidth: "15%",
        },
        {
            name: __('Daily Limit', 'gameengine'),
            cell: row => row.daily_limit,
            columnWidth: "15%",
        },
        {
            name: __('Action', 'gameengine'),
            cell: row => {
                const options = [
                    {
                        type: 'button',
                        label: __('Edit', 'gameengine'),
                        icon: <FiEdit />,
                        onClick: () => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels&action=edit&id=${row.id}`)
                    },
                    {
                        type: 'button',
                        label: __('Analytics', 'gameengine'),
                        icon: <FiActivity />,
                        onClick: () => setAnalyticsId(row.id),
                        hasBorder: true,
                    },
                    {
                        type: 'button',
                        label: __('Delete', 'gameengine'),
                        suffix: 'trash',
                        icon: <FiTrash2 />,
                        onClick: () => handleDelete(row.id)
                    }
                ];
                return <OptionMenu options={options} />;
            },
            columnWidth: "15%",
        },
    ];

    return (
        <>
            <TopBar path={__("Lucky Wheels", "gameengine")}
                rightContent={
                    <div className="flex items-center gap-2">
                        <WhatsNew />

                        <GetHelp filterText={['lucky-wheels']} />
                    </div>
                }
            />

            <div className='gameengine-page-content'>
                <div className="flex justify-between items-center py-6 px-1">
                    <p className="gameengine-page-heading">
                    {__('Lucky Wheels', 'gameengine')}
                    </p>

                    <Button
                        label={__("Add New Wheel", "gameengine")}
                        icon={<FiPlus />}
                        onClick={() => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels&action=new`)}
                    />
                </div>

                <ListTable
                    key={'lucky-wheels-' + wheels.length}
                    columns={columns}
                    showColumnFilter={false}
                    data={wheels}
                    showSubHeader={false}
                    isRowSelectable={false}
                    showPagination={false}
                    noDataText={__('No Lucky Wheels found', 'gameengine')}
                    totalItems={wheels.length}
                    totalRows={wheels.length}
                    rowsPerPage={10}
                    currentPageNumber={[1]}
                    dataFetchingStatus={dataFetchingStatus}
                />
            </div>

            <WheelAnalytics 
                wheelId={analyticsId} 
                isOpen={!!analyticsId} 
                onClose={() => setAnalyticsId(null)} 
            />
        </>
    );
};
