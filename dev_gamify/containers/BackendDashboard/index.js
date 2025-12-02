import React from 'react';

// import Points from './points';
// import Logs from './logs';
// import Settings from './settings';
// import PointType from './points/PointType';
// import Achievements from './achievements/';
// import AchievementsType from './achievements/AchievementTypes';
// import Levels from './levels';
// import LevelType from './levels/levelTypes';
// import Leaderboards from './leaderboards';
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

const renderSwitch = (page, id, action, path) => {
	console.log('PAGE =>',page, id, action, path);

	switch (page) {
		case 'gamify':
			return <Dashboard />;
		case 'gamify-points':
            if (action || id) {
				return <PointType action={action} id={id} />;
			}
			return <Points />;

		case 'gamify-logs':
			return <Logs />;

		case 'gamify-settings':
			return <Settings />;

		case 'point-type':
			return <PointType />;

		case 'gamify-achievements':
			return <Achievements />;

		case 'achievements-type':
			return <AchievementsType />;

		case 'gamify-levels':
			return <Levels />;

		case 'level-type':
			return <LevelType />;

		case 'gamify-leaderboards':
			return <Leaderboards />;

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
