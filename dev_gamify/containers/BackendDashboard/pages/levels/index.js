import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Badge } from '@chakra-ui/react'; // Badge Added
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { __ } from '@wordpress/i18n';

// Components
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';

// Actions
import { fetchLevels, deleteLevel } from '../../../../redux/Slices/levelsSlice/levelsSlice';

const Levels = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Safe destructuring
    const { levels = [], status } = useSelector(state => state.levels || {});

    useEffect(() => {
        dispatch(fetchLevels());
    }, [dispatch]);

    // Optional: Color helper for categories
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Optional: Show Level Icon if available */}
                    {row.icon && <img src={row.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row.title}</span>
                </div>
            )
        },
        {
            name: __('Plural Name', 'gamify'),
            cell: (row) => row.plural_name
        },
        // 🔥 NEW: Category Column
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
        <>
            <TopBar leftContent={() => (
                <>
                    <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" />
                    <span className="gamify-icon gamify-icon--angle-right" />
                    <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__(`Game Engine`, 'gamify')} />
                </>
            )} />
            <Box width="1174px" margin="0 auto" height="100vh">
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Levels Types`, 'gamify')} />
                    <Button {...primaryBtn} onClick={() => navigate(`${route_path}admin.php?page=gamify-levels&path=levels-types`)}>
                        {__('+ Add new level', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>
                <ListTable
                    columns={columns}
                    data={levels}
                    noDataText="No levels found"
                    isLoading={status === 'loading'}
                />
            </Box>
        </>
    );
};

export default Levels;