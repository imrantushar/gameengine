import React, { useEffect } from 'react';
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

    useEffect(() => {
        dispatch(fetchLevels());
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
            name: __('Name', 'gamify'),
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(`${route_path}admin.php?page=gamify-levels&path=levels-types&id=${row.id}`)}>
                    {/* Optional: Show Level Icon if available */}
                    {row.icon && <img src={row.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row.title}</span>
                </div>
            )
        },
        {
            name: __('Category', 'gamify'),
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
            name: __('Unlock Criteria', 'gamify'),
            cell: (row) => parseInt(row.unlock_with_points_enabled)
                ? `${row.min_points} - ${row.max_points} Points`
                : 'Triggers'
        },
        {
            name: __('Date', 'gamify'),
            cell: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            name: __('Action', 'gamify'),
            cell: (row) => (
                <OptionMenu options={[
                    {
                        type: "button",
                        label: __('Edit', 'gamify'),
                        icon: <Icon as={FiEdit} />,
                        onClick: () => navigate(`${route_path}admin.php?page=gamify-levels&path=levels-types&id=${row.id}`)
                    },
                    {
                        type: "button",
                        suffix: "trash",
                        label: __('Delete', 'gamify'),
                        icon: <Icon as={FiTrash2} />,
                        onClick: () => { if (confirm('Delete level?')) dispatch(deleteLevel(row.id)); }
                    },
                ]} />
            ),
        },
    ];

    return (
        <div className='gamify-page-content'>
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Levels Types", "gamify")} />

                <Button
                    {...primaryBtn}
                    onClick={() => navigate(`${route_path}admin.php?page=gamify-levels&path=levels-types`)}
                >
                    <Icon as={GoPlus} boxSize="20px" /> {__('Add new level', 'gamify')}
                </Button>
            </Flex>

            <ListTable
                columns={columns}
                showSubHeader={false}
                data={levels}
                noDataText={__("No data found for levels", "gamify")}
                isLoading={status === 'loading'}
            />
        </div>
    );
};

export default LevelTable;
