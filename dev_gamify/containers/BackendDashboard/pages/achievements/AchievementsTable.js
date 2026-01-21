import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import ListTable from '@GFComponents/ListTable';
import { Button, Flex, Icon, Badge, CheckboxGroup } from '@chakra-ui/react';
import OptionMenu from '@GFComponents/OptionMenu';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { deleteAchievement, fetchAchievements } from '@GFRedux/Slices/achivementSlice/achievementsSlice';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { GoPlus } from 'react-icons/go';

const AchievementsTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { achievements } = useSelector(state => state.achievements);
    const [loading, setLoading] = useState(achievements.length === 0);

    useEffect(() => {
        setLoading(true)
        dispatch(fetchAchievements()).then(() => {
            setLoading(false)
        });
    }, []);

    if(loading) return "loading"

    const handleDelete = (id) => {
        if (confirm(__('Are you sure?', 'gamify'))) {
            dispatch(deleteAchievement(id));
        }
    };

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
            cell: (row = {}) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: "pointer" }} onClick={() => navigate(`${route_path}admin.php?page=gamify-achievements&action=edit&id=${row?.id}&path=achievements-type`)}
                >
                    {row?.badge_image && <img src={row?.badge_image} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: 500 }}>{row?.title}</span>
                </div>
            ),
            columnWidth: "180px",
            textAlign: "start",
        },
        {
            name: __('Category', 'gamify'),
            cell: (row = {}) => (
                row?.category ? (
                    <Badge colorScheme={getCategoryColor(row?.category)} variant="subtle" borderRadius="4px" px={2}>
                        {row?.category}
                    </Badge>
                ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                )
            ),
        },
        {
            name: __('Date', 'gamify'),
            cell: (row = {}) => new Date(row?.created_at).toLocaleDateString(),
        },
        {
            name: __('Action', 'gamify'),
            cell: (row = {}) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: __('Edit', 'gamify'),
                            icon: <Icon as={FiEdit} />,
                            onClick: () => navigate(`${route_path}admin.php?page=gamify-achievements&action=edit&id=${row?.id}&path=achievements-type`)
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gamify'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => handleDelete(row?.id)
                        },
                    ]}
                />
            ),
            textAlign: "end",
        },
    ];

    return (
        <div className='gamify-page-content'>
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Achievements", "gamify")} />

                <Button
                    {...primaryBtn}
                    onClick={() => navigate(`${route_path}admin.php?page=gamify-achievements&path=achievements-type`)}
                >
                    <Icon as={GoPlus} boxSize="20px" /> {__('Add new achievement', 'gamify')}
                </Button>
            </Flex>

            {loading ? "loading" : (
                <ListTable
                    key={'acievements-table-'+ achievements?.length}
                    columns={columns}
                    data={achievements}
                    showSubHeader={false}
                    showColumnFilter={false}
                    isRowSelectable={false}
                    showPagination={true}
                    noDataText={__("No data found for Achievements", "gamify")}
                    suffix="achievements-table"
                />
            )}
        </div>
    );
};

export default AchievementsTable;
