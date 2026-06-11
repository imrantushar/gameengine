import React, { useEffect, useState } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import GameEngineBox from '@GFComponents/GameEngineBox';
import WPModal from '@GFComponents/Modal/WPModal';

export default function WheelAnalytics({ wheelId, isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!isOpen || !wheelId) return;

        setLoading(true);
        fetch(`${window.GameEngineGlobal.rest_url}gameengine/v1/lucky-wheels/analytics/${wheelId}`, {
            headers: { 'X-WP-Nonce': window.GameEngineGlobal.nonce },
        })
            .then(res => res.json())
            .then(result => {
                setData(result);
            })
            .catch(err => console.error('Analytics fetch error:', err))
            .finally(() => setLoading(false));
    }, [isOpen, wheelId]);

    return (
        <WPModal 
            isOpen={isOpen} 
            onRequestClose={onClose} 
            title={__('Wheel Analytics & Leads', 'gameengine')}
            size="large"
        >
            {loading ? (
                <div className="flex justify-center items-center" style={{ height: '200px' }}>
                    <Spinner />
                </div>
            ) : !data ? (
                <p className="text-center">{__('Failed to load analytics.', 'gameengine')}</p>
            ) : (
                <div className="flex flex-col gap-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <GameEngineBox>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium capitalize m-0">{__('Spins Today', 'gameengine')}</p>
                                <p className="text-2xl font-black text-blue-600 m-0">{data.spins_today}</p>
                            </div>
                        </GameEngineBox>
                        <GameEngineBox>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium capitalize m-0">{__('Total Spins', 'gameengine')}</p>
                                <p className="text-2xl font-black text-purple-600 m-0">{data.total_spins}</p>
                            </div>
                        </GameEngineBox>
                        <GameEngineBox>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium capitalize m-0">{__('Points Awarded', 'gameengine')}</p>
                                <p className="text-2xl font-black text-green-600 m-0">{data.total_points_awarded}</p>
                            </div>
                        </GameEngineBox>
                        <GameEngineBox>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium capitalize m-0">{__('Unique Players', 'gameengine')}</p>
                                <p className="text-2xl font-black text-orange-500 m-0">{data.unique_users}</p>
                            </div>
                        </GameEngineBox>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <GameEngineBox heading={__('Prize Distribution', 'gameengine')}>
                                {data.prize_distribution && Object.keys(data.prize_distribution).length > 0 ? (
                                    <div className="flex flex-col gap-3 mt-4">
                                        {Object.entries(data.prize_distribution).map(([prize, count]) => (
                                            <div key={prize} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                                                <span className="font-semibold">{prize}</span>
                                                <span className="font-bold text-blue-600">{count} {__('times', 'gameengine')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-2">{__('No prizes awarded yet.', 'gameengine')}</p>
                                )}
                            </GameEngineBox>
                        </div>

                        <div className="flex-1">
                            <GameEngineBox heading={__('Collected Guest Emails (Leads)', 'gameengine')}>
                                {data.guest_emails && data.guest_emails.length > 0 ? (
                                    <div className="flex flex-col gap-2 mt-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
                                        {data.guest_emails.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-blue-50 p-2 rounded-md border-l-4 border-blue-400">
                                                <span className="text-sm font-medium">{item.guest_email}</span>
                                                <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-2">{__('No guest emails collected yet.', 'gameengine')}</p>
                                )}
                            </GameEngineBox>
                        </div>
                    </div>
                </div>
            )}
        </WPModal>
    );
}
