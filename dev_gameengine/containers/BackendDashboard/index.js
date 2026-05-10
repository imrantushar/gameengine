import React from 'react';
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
import AdminActivityFeed from '@GFComponents/AdminActivityFeed';
import Tools from './pages/tools';
import Types from './pages/Types';
import Wallet from './pages/walletLists';
import Referrals from './pages/referrals';
import LuckyWheels from './pages/lucky-wheels';
import Ranks from './pages/ranks';
import Badges from './pages/badges';
import Streaks from './pages/streaks';
import Analytics from './pages/analytics';
import BonusRules from './pages/bonus-rules';
import Seasons from './pages/seasons';
import Webhooks from './pages/webhooks';
import { useLocationQuery } from '@GFHooks/';
import LicenseNotice from '@GFComponents/LicenseNotice';

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
			return <Addons />;

		case 'gameengine-wallet':
			return <Wallet />;

		case 'gameengine-referrals':
			return <Referrals />;

		case 'gameengine-lucky-wheels':
			return <LuckyWheels action={action} id={id} />;

		case 'gameengine-ranks':
			return <Ranks />;

		case 'gameengine-badge-editor':
			return <Badges />;

		case 'gameengine-streaks':
			return <Streaks />;

		case 'gameengine-analytics':
			return <Analytics />;

		case 'gameengine-bonus-rules':
			return <BonusRules />;

		case 'gameengine-seasons':
			return <Seasons />;

		case 'gameengine-webhooks':
			return <Webhooks />;

		default:
			return <Dashboard />;
	}
};

export default function BackendDashboard() {
	const query = useLocationQuery();

	const page = query.getValue('page', null, null, 'string');
	const path = query.getValue('path', null, null, 'string');
	const id = query.getValue('id', null, null, 'id');
	const action = query.getValue('action', null, null, 'string');

	let transitionKey = `${page}-${path}-${id}-${action}`;

	if (page === 'gameengine-settings' || page=== 'gameengine-tools') {
		transitionKey = page;
	}

	return (
		<div className="gameengine-admin-content">
			<LicenseNotice />
			<Notification />
			<div style={{ position: 'fixed', top: '36px', right: '16px', zIndex: 4000 }}>
				<AdminActivityFeed />
			</div>
			<div className="gameengine-page-transition" key={transitionKey}>
				{ renderSwitch( page, id, action, path ) }
			</div>
		</div>
	);
}
