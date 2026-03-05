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
import Types from './pages/Types';
import Wallet from './pages/walletLists';

const renderSwitch = (page, id, action, path) => {

	switch (page) {
		case 'gameengine':
			return <Dashboard />;
		case 'gameengine-points':
			if (path === "points-types") {
				return <PointTypeEditor />;
			}
			if (action || id) {
				return <PointTypeEditor action={action} id={id} />;
			}
			return <Points />;
		case 'gameengine-logs':
			return <Logs />;

		case 'gameengine-settings':
			return <Settings />;

		case 'point-type':
			return <PointTypeEditor />;

		case 'gameengine-achievements':
			if (path === 'achievement-types') {
				return <Types type={'achievement'} />
			}
			if (action || id) {
				return <AchievementTypesEditor action={action} id={id} />;
			}
			return <Achievements />;

		case 'gameengine-levels':
			if (path === 'level-types') {
				return <Types type={'level'} />;
			}
			if (action || id) {
				return <LevelType />;
			}
			return <Levels />;
		case 'gameengine-leaderboards':
			return <Leaderboards />;

		case 'gameengine-tools':
			return <Tools />;

			case 'gameengine-addons':
			return <Addons/>;
			
			case 'gameengine-wallet':
			return <Wallet/>;

		default:
			return <Dashboard />;
	}
};

export default function BackendDashboard() {
	const query = useQuery();

	return (
		<div className="gameengine-admin-content">
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
