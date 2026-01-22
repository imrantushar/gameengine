import React, { useEffect } from 'react';
import { useQuery } from '@GFUtils/helper';
import Dashboard from './pages/dashboard';
import Levels from './pages/levels';
import LevelType from './pages/levels/levelTypes';
import Leaderboards from './pages/leaderboards';
import AchievementTypesEditor from './pages/achievements/AchievementTypesEditor';
import Achievements from './pages/achievements';
import PointTypeEditor from './pages/points/PointTypeEditor';
import Settings from './pages/settings';
import Logs from './pages/logs';
import Points from './pages/points';
import Addons from './pages/addon';
import Notification from '@GFComponents/Notification';
import Tools from './pages/tools';

const renderSwitch = (page, id, action, path) => {

	switch (page) {
		case 'gamify':
			return <Dashboard />;
		case 'gamify-points':
			if (path === "points-types") {
				return <PointTypeEditor />;
			}
			if (action || id) {
				return <PointTypeEditor action={action} id={id} />;
			}
			return <Points />;
		case 'gamify-logs':
			return <Logs />;

		case 'gamify-settings':
			return <Settings />;

		case 'point-type':
			return <PointTypeEditor />;

		case 'gamify-achievements':
			if (path === 'achievements-type') {
				return <AchievementTypesEditor />
			}
			if (action || id) {
				return <AchievementTypesEditor action={action} id={id} />;
			}
			return <Achievements />;

		case 'gamify-levels':
			if (path === 'levels-types') {
				return <LevelType />;
			}
			return <Levels />;
		case 'gamify-leaderboards':
			return <Leaderboards />;

		case 'gamify-tools':
			return <Tools />;

			case 'gamify-addons':
			return <Addons/>;

		default:
			return <>No page found</>;
	}
};

export default function BackendDashboard() {
	const query = useQuery();

	return (
		<div className="gamify-admin-content">
			<Notification />
			{renderSwitch(
				query.get('page'),
				parseInt(query.get('id')),
				query.get('action'),
				query.get('path')
			)}
		</div>
	);
}
