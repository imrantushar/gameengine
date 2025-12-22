import React, { useEffect } from 'react';
import { useQuery } from '@GFUtils/helper';
import Dashboard from './pages/dashboard';
import Levels from './pages/levels';
import LevelType from './pages/levels/levelTypes';
import Leaderboards from './pages/leaderboards';
import AchievementsType from './pages/achievements/AchievementTypes';
import Achievements from './pages/achievements';
import PointType from './pages/points/PointType';
import Settings from './pages/settings';
import Logs from './pages/logs';
import Points from './pages/points';
import Addons from './pages/Addon';

const renderSwitch = (page, id, action, path) => {

	switch (page) {
		case 'gamify':
			return <Dashboard />;
		case 'gamify-points':
			if(path === "points-types"){
             return <PointType />;
			}
			if ( action || id ) {
				return <PointType action={ action } id={ id } />;
			}
			return <Points />;
		case 'gamify-logs':
			return <Logs />;

		case 'gamify-settings':
			return <Settings />;

		case 'point-type':
			return <PointType />;

		case 'gamify-achievements':
			if(path === 'achievements-type'){
				return <AchievementsType />
			}
			if ( action || id ) {
				return <AchievementsType action={ action } id={ id } />;
			}
			return <Achievements />;

		case 'gamify-levels':
			if(path === 'levels-types'){
				return <LevelType />;
			}
			return <Levels />;
		case 'gamify-leaderboards':
			return <Leaderboards />;

		case 'gamify-addons':
			return <Addons />;

		default:
			return <>No page found</>;
	}
};

export default function BackendDashboard() {
	const query = useQuery();
	
	return (
		<div className="gamify-admin-content">
			{renderSwitch(
				query.get('page'),
				parseInt(query.get('id')),
				query.get('action'),
				query.get('path')
			)}
		</div>
	);
}
