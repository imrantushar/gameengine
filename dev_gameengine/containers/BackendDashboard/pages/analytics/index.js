import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Button from '@GFComponents/Button';
import GetHelp from '@GFComponents/GetHelp';
import { admin_url } from '@GFUtils/helper';

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1 bg-white border border-gray-100 rounded-lg p-4 shadow-sm min-w-[140px]">
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
    <span className="text-2xl font-bold text-gray-800">{value ?? '—'}</span>
  </div>
);

const ExportBtn = ({ endpoint }) => (
  <Button
    preset="gray"
    label={__('Export CSV', 'gameengine')}
    onClick={() => { window.location.href = endpoint + '&format=csv'; }}
  />
);

const Analytics = () => {
  const [gainLoss, setGainLoss] = useState(null);
  const [topEarners, setTopEarners] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [circulation, setCirculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [gl, te, dist, circ] = await Promise.all([
          apiFetch({ path: '/gameengine/v1/analytics/gain-loss' }).catch(() => null),
          apiFetch({ path: '/gameengine/v1/analytics/top-earners' }).catch(() => []),
          apiFetch({ path: '/gameengine/v1/analytics/distribution' }).catch(() => []),
          apiFetch({ path: '/gameengine/v1/analytics/circulation' }).catch(() => null),
        ]);
        setGainLoss(gl);
        setTopEarners(Array.isArray(te) ? te : te?.data || []);
        setDistribution(Array.isArray(dist) ? dist : dist?.data || []);
        setCirculation(circ);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <>
        <TopBar path={__('Analytics', 'gameengine')} rightContent={<GetHelp filterText={['analytics']} />} />
        <div className="gameengine-page-content">
          <p className="py-10 text-center text-gray-400">{__('Loading analytics…', 'gameengine')}</p>
        </div>
      </>
    );
  }

  const baseUrl = window.wpApiSettings?.root + 'gameengine/v1/analytics/';

  return (
    <>
      <TopBar path={__('Analytics', 'gameengine')} rightContent={<GetHelp filterText={['analytics']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <GFLabel type="plainHeading" margin={0} label={__('Analytics', 'gameengine')} />
        </div>

        <div className="flex flex-col gap-6">

          {/* Gain / Loss */}
          <GameEngineBox dynamicClasses="analytics-gainloss" heading={__('Points Gain / Loss', 'gameengine')}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex flex-wrap gap-3">
                <StatCard label={__('Total Earned', 'gameengine')} value={gainLoss?.total_earned?.toLocaleString()} />
                <StatCard label={__('Total Spent', 'gameengine')} value={gainLoss?.total_spent?.toLocaleString()} />
                <StatCard label={__('Net Change', 'gameengine')} value={gainLoss?.net?.toLocaleString()} />
              </div>
              <ExportBtn endpoint={baseUrl + 'gain-loss?_wpnonce=' + (window.wpApiSettings?.nonce || '')} />
            </div>
          </GameEngineBox>

          {/* Top Earners */}
          <GameEngineBox dynamicClasses="analytics-earners" heading={__('Top Earners', 'gameengine')}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{__('Top 20 users by total points earned', 'gameengine')}</span>
              <ExportBtn endpoint={baseUrl + 'top-earners?_wpnonce=' + (window.wpApiSettings?.nonce || '')} />
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">#</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">{__('User', 'gameengine')}</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">{__('Point Type', 'gameengine')}</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">{__('Balance', 'gameengine')}</th>
                </tr>
              </thead>
              <tbody>
                {topEarners.length ? topEarners.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-3 font-medium">{row.display_name || row.user_login || '—'}</td>
                    <td className="py-2 px-3 text-gray-500">{row.point_type_name || '—'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{row.balance?.toLocaleString() ?? '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">{__('No data available.', 'gameengine')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </GameEngineBox>

          {/* Balance Distribution */}
          <GameEngineBox dynamicClasses="analytics-distribution" heading={__('Balance Distribution', 'gameengine')}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{__('User count per balance range', 'gameengine')}</span>
              <ExportBtn endpoint={baseUrl + 'distribution?_wpnonce=' + (window.wpApiSettings?.nonce || '')} />
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">{__('Range', 'gameengine')}</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">{__('Users', 'gameengine')}</th>
                </tr>
              </thead>
              <tbody>
                {distribution.length ? distribution.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{row.range || '—'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{row.user_count ?? '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-gray-400">{__('No data available.', 'gameengine')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </GameEngineBox>

          {/* Circulation */}
          <GameEngineBox dynamicClasses="analytics-circulation" heading={__('Points Circulation', 'gameengine')}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex flex-wrap gap-3">
                <StatCard label={__('Total in Circulation', 'gameengine')} value={circulation?.total_circulation?.toLocaleString()} />
                <StatCard label={__('Active Users', 'gameengine')} value={circulation?.active_users?.toLocaleString()} />
                <StatCard label={__('Avg Balance', 'gameengine')} value={circulation?.avg_balance?.toLocaleString()} />
              </div>
              <ExportBtn endpoint={baseUrl + 'circulation?_wpnonce=' + (window.wpApiSettings?.nonce || '')} />
            </div>
          </GameEngineBox>

        </div>
      </div>
    </>
  );
};

export default Analytics;
