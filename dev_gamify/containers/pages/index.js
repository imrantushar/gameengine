import React from 'react';
import Dashboard from './dashboard';
import Points from './points';
import Logs from './logs';
import Settings from './settings';
import PointType from './points/PointType';
import Achievements from './achievements/';
import AchievementsType from './achievements/AchievementTypes';
import Levels from './levels';
import LevelType from './levels/levelTypes';
import Leaderboards from './leaderboards';
import { useQuery } from '@Utils/helper';

const renderSwitch = (page) => {
	console.log('PAGE =>', page);

	switch (page) {
		case 'gamify':
			return <Dashboard />;

		case 'points':
			return <Points />;

		case 'logs':
			return <Logs />;

		case 'settings':
			return <Settings />;

		case 'point-type':
			return <PointType />;

		case 'achievements':
			return <Achievements />;

		case 'achievements-type':
			return <AchievementsType />;

		case 'levels':
			return <Levels />;

		case 'level-type':
			return <LevelType />;

		case 'leaderboards':
			return <Leaderboards />;

		default:
			return <>No page found</>;
	}
};

export default function BackendDashboard() {
	const query = useQuery();

	 console.log(query);

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
