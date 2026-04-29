import React from 'react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { FiUsers, FiUserCheck, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, icon: IconComponent, color, bgClass }) => (
    <div
        className={`flex items-center justify-between ${bgClass} py-8 px-6 gap-6 rounded flex-1`}
        style={{ boxShadow: 'var(--gameengine-shadow)' }}
    >
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold leading-tight m-0" style={{ color: 'var(--gameengine-font-color)' }}>
                {value}
            </span>
            <span className="text-base font-medium leading-6 m-0" style={{ color: 'var(--gameengine-font-color)' }}>
                {title}
            </span>
        </div>
        <div className="p-3.5 rounded-full" style={{ backgroundColor: color }}>
            <IconComponent size={32} color="#fff" />
        </div>
    </div>
);

const ReferralsStats = () => {
    const { stats } = useSelector(state => state.referrals);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
                title={__('Total Referrals', 'gameengine')}
                value={stats.total_referrals}
                icon={FiUsers}
                color="#2E90FA"
                bgClass="bg-blue-50"
            />
            <StatCard
                title={__('Converted Signup', 'gameengine')}
                value={stats.converted}
                icon={FiUserCheck}
                color="#12B76A"
                bgClass="bg-green-50"
            />
            <StatCard
                title={__('Top Referrer', 'gameengine')}
                value={stats.top_referrer_name || __('None', 'gameengine')}
                icon={FiTrendingUp}
                color="#F79009"
                bgClass="bg-orange-50"
            />
        </div>
    );
};

export default ReferralsStats;
