import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
} from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2, FiPlus, FiActivity } from "react-icons/fi";
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import OptionMenu from '@GFComponents/OptionMenu';
import { useNavigate } from 'react-router-dom';
import { route_path } from '@GFUtils/helper';
import WheelEditor from './WheelEditor';
import WheelAnalytics from './WheelAnalytics';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

export default function LuckyWheels({ action, id }) {
    const [wheels, setWheels] = useState([]);
    const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
    const [analyticsId, setAnalyticsId] = useState(null);
    const navigate = useNavigate();

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
                <Text fontWeight="500">{row.name || '—'}</Text>
            ),
            columnWidth: "30%",
        },
        {
            name: __('Shortcode', 'gameengine'),
            cell: row => (
                <code style={{ background: '#f0f0f0', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>
                    [gameengine_wheel id="{row.id}"]
                </code>
            ),
            columnWidth: "25%",
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
                        icon: <Icon as={FiEdit} />,
                        onClick: () => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels&action=edit&id=${row.id}`)
                    },
                    {
                        type: 'button',
                        label: __('Analytics', 'gameengine'),
                        icon: <Icon as={FiActivity} />,
                        onClick: () => setAnalyticsId(row.id)
                    },
                    {
                        type: 'button',
                        label: __('Delete', 'gameengine'),
                        icon: <Icon as={FiTrash2} />,
                        onClick: () => handleDelete(row.id)
                    }
                ];
                return <OptionMenu options={options} />;
            },
            columnWidth: "15%",
            textAlign: "end",
        },
    ];

    return (
        <>
            <TopBar path={__("Lucky Wheels", "gameengine")} />

            <div className='gameengine-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Lucky Wheels", "gameengine")} />
                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels&action=new`)}
                    >
                        <Icon as={FiPlus} boxSize="20px" /> {__("Add New Wheel", "gameengine")}
                    </Button>
                </Flex>

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
