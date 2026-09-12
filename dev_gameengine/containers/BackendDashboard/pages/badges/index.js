import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';
import Button from '@GFComponents/Button';
import { route_path } from '@GFUtils/helper';
import { fetchBadges, deleteBadge } from '@GFRedux/Slices/badgesSlice/badgesSlice';
import { BadgeGlyph, IconButton } from './helper';

const LIST_URL = `${route_path}admin.php?page=gameengine-badge-editor`;

const BadgesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, status } = useSelector((state) => state.badges);

    useEffect(() => {
        if (items.length === 0) dispatch(fetchBadges());
    }, []);

    const handleDelete = (badge) => {
        if (window.confirm(__('Delete permanently? This cannot be undone.', 'gameengine'))) {
            dispatch(deleteBadge(badge.id));
        }
    };

    return (
        <>
            <TopBar
                path={__('Badge Editor', 'gameengine')}
                rightContent={<GetHelp filterText={['badges']} />}
            />

            <div className="gameengine-page-content">
                <div className="flex justify-between items-center py-6 px-1">
                    <div>
                        <h2 className="gameengine-page-heading">{__('Badges', 'gameengine')}</h2>
                        <p className="text-xs m-0 mt-1 text-[var(--gameengine-warn-muted)]">
                            {__('Artwork you can attach to an achievement or a level.', 'gameengine')}
                        </p>
                    </div>

                    <Button
                        label={__('Add new badge', 'gameengine')}
                        icon={<GoPlus size="16px" />}
                        onClick={() => navigate(`${LIST_URL}&action=new`)}
                    />
                </div>

                {status === 'loading' && items.length === 0 && (
                    <p className="text-sm px-1 text-[var(--gameengine-warn-muted)]">
                        {__('Loading badges…', 'gameengine')}
                    </p>
                )}

                {status !== 'loading' && items.length === 0 && (
                    <div className="text-center py-12 text-[var(--gameengine-placeholder)]">
                        <p>{__('No badges yet. Create your first badge!', 'gameengine')}</p>
                    </div>
                )}

                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
                >
                    {items.map((badge) => (
                        <div
                            key={badge.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`${LIST_URL}&action=edit&id=${badge.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(`${LIST_URL}&action=edit&id=${badge.id}`);
                                }
                            }}
                            className="bg-[var(--gameengine-background)] rounded-lg border border-[var(--gameengine-border-color)] shadow-sm p-4 flex flex-col items-center gap-3 cursor-pointer transition-shadow hover:shadow-md"
                        >
                            <BadgeGlyph badge={badge} size={64} />

                            <span className="text-sm font-medium text-center text-[var(--gameengine-font-color)]">
                                {badge.title || __('Untitled', 'gameengine')}
                            </span>

                            <div
                                className="flex gap-1 pt-3 mt-auto w-full justify-center"
                                style={{ borderTop: '1px solid var(--gameengine-border-color)' }}
                            >
                                <IconButton
                                    label={__('Edit badge', 'gameengine')}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`${LIST_URL}&action=edit&id=${badge.id}`);
                                    }}
                                >
                                    <FiEdit size={15} />
                                </IconButton>

                                <IconButton
                                    tone="danger"
                                    label={__('Delete badge', 'gameengine')}
                                    onClick={(e) => { e.stopPropagation(); handleDelete(badge); }}
                                >
                                    <FiTrash2 size={15} />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BadgesPage;
