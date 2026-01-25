import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Icon, Badge } from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { fetchLevels, deleteLevel } from '../../../../redux/Slices/levelsSlice/levelsSlice';
import { GoPlus } from 'react-icons/go';

const LevelTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { levels = [], status } = useSelector(state => state.levels || {});
        const [loading, setLoading] = useState(levels.length === 0);

    useEffect(() => {
        setLoading(true)
        dispatch(fetchLevels()).then(() => {
            setLoading(false)
        });
    }, []);

    const getCategoryColor = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'gold': return 'yellow';
            case 'silver': return 'gray';
            case 'bronze': return 'orange';
            default: return 'green';
        }
    };

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(`${route_path}admin.php?page=gameengine-levels&path=levels-types&id=${row.id}`)}>
                    {/* Optional: Show Level Icon if available */}
                    {row.icon && <img src={row.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row.title}</span>
                </div>
            ),
            textAlign: "start",
        },
        {
            name: __('Category', 'gameengine'),
            cell: (row) => (
                row.category ? (
                    <Badge colorScheme={getCategoryColor(row.category)} variant="subtle" borderRadius="4px" px={2}>
                        {row.category}
                    </Badge>
                ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                )
            ),
        },
        {
            name: __('Unlock Criteria', 'gameengine'),
            cell: (row) => parseInt(row.unlock_with_points_enabled)
                ? `${row.min_points} - ${row.max_points} Points`
                : 'Triggers'
        },
        {
            name: __('Date', 'gameengine'),
            cell: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            name: __('Action', 'gameengine'),
            cell: (row) => (
                <OptionMenu options={[
                    {
                        type: "button",
                        label: __('Edit', 'gameengine'),
                        icon: <Icon as={FiEdit} />,
                        onClick: () => navigate(`${route_path}admin.php?page=gameengine-levels&action=edit&id=${row.id}`)
                    },
                    {
                        type: "button", 
                        suffix: "trash",
                        label: __('Delete', 'gameengine'),
                        icon: <Icon as={FiTrash2} />,
                        onClick: () => { if (confirm('Delete level?')) dispatch(deleteLevel(row.id)); }
                    },
                ]} />
            ),
            textAlign: "end",
        },
    ];

    return (
        <div className='gameengine-page-content'>
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Levels", "gameengine")} />

                <Button
                    {...primaryBtn}
                    onClick={() => navigate(`${route_path}admin.php?page=gameengine-levels&action=new`)}
                >
                    <Icon as={GoPlus} boxSize="20px" /> {__('Add new level', 'gameengine')}
                </Button>
            </Flex>

            <ListTable
                columns={columns}
                showSubHeader={false}
                data={levels}
                noDataText={__("No data found for levels", "gameengine")}
                dataFetchingStatus={loading}
                isRowSelectable={false}
            />
        </div>
    );
};

export default LevelTable;
