import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WPMenuSync from '../../components/WPMenuSync';
import Dashboard from './dashboard';
import Points from './points';
import Logs from './logs';
import Settings from './settings';
import PointType from './points/PointType';
import Achievements from './achievements/'
import AchievementsType from './achievements/AchievementTypes'
import Levels from './levels';
import LevelType from './levels/levelTypes';
import Leaderboards from './leaderboards';

const App = () => {
    return (
        <div>

            <WPMenuSync />

            <div className="gamify-admin-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/points" element={<Points />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/point-type" element={<PointType />} />
                    <Route path="*" element={<Dashboard />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/achievementsType" element={<AchievementsType />} />
                    <Route path="/levels" element={<Levels />} />
                    <Route path="/level-type" element={<LevelType/>} />
                    <Route path="/leaderboards" element={<Leaderboards />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;