import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Box, Button, Flex, Icon, Badge } from '@chakra-ui/react'; // Badge Import Added
import OptionMenu from '@GFComponents/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { fetchAchievements, deleteAchievement } from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { FaChevronRight } from 'react-icons/fa6';

const Achievements = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { achievements } = useSelector(state => state.achievements);

    useEffect(() => {
        dispatch(fetchAchievements());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (confirm(__('Are you sure?', 'gamify'))) {
            dispatch(deleteAchievement(id));
        }
    };

    // Helper to pick color based on category name (Optional UI polish)
    const getCategoryColor = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'gold': return 'yellow';
            case 'silver': return 'gray';
            case 'bronze': return 'orange';
            default: return 'blue';
        }
    };

    const columns = [
        {
            name: __('Name', 'gamify'),
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Optional: Show icon if available */}
                    {row.badge_image && <img src={row.badge_image} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row.title}</span>
                </div>
            )
        },
        {
            name: __('Plural Name', 'gamify'),
            cell: (row) => row.description,
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
            name: __('Date', 'gamify'),
            cell: (row) => new Date(row.created_at).toLocaleDateString(),
        },
        {
            name: __('Action', 'gamify'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: __('Edit', 'gamify'),
                            icon: <Icon as={FiEdit} />,
                            onClick: () => navigate(`${route_path}admin.php?page=gamify-achievements&action=edit&id=${row.id}&path=achievements-type`)
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gamify'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => handleDelete(row.id)
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
                                <path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
                            </svg>
                        </span>
                        <span className="gamify-icon gamify-icon--angle-right">
                            <FaChevronRight />
                        </span>

                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="400" 
                            fontSize='12px'
                            label={__(`Game Engine`, 'gamify')}
                        />
                    </>
                )}
            />
            <Box width="1174px" margin="0 auto" height="100vh">
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Achievements`, 'gamify')}
                    />
                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${route_path}admin.php?page=gamify-achievements&path=achievements-type`)}
                    >
                        {__('+ Add new achievement', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>
                <ListTable
                    columns={columns}
                    data={achievements}
                    showSubHeader={false} // You can enable this later for search/filter
                    showColumnFilter={false}
                    isRowSelectable={true}
                    showPagination={true} // Pagination enabled just in case
                    noDataText="No data found"
                />
            </Box>
        </>
    );
};

export default Achievements;