import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "@GFComponents/UI";
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import TopUsers from "./TopUsers";
import Distribution from "./Distribution";
import Overview from "./Overview";
import { fetchDashboardData } from '@GFRedux/Slices/dashboardSlice/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    overview,
    chart,
    topUsers,
    status
  } = useSelector(state => state.dashboard);

  // Keep Date State here so it doesn't get lost on re-render
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Initial Load
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);
  const handleFilterChange = useCallback((start, end) => {
    dispatch(fetchDashboardData({
      start_date: start,
      end_date: end
    }));
  }, [dispatch]);

  // Only show full page spinner on very first load (Initial loading)
  if (status === 'loading' && overview.points === 0) {
    return <div className="flex items-center justify-center" style={{
      "height": "100vh"
    }}><Spinner size="xl" color="blue.500" /></div>;
  };
  
  return <>
    <TopBar path={__("Dashboard", "gameengine")} />

    <div className="gameengine-page-content flex flex-col gap-6">
      <Overview data={overview} onFilterChange={handleFilterChange} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />

      <Distribution chartData={chart} />

      <TopUsers users={topUsers} />
    </div>
  </>;
};

export default Dashboard;