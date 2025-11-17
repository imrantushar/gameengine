import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './Dashboard';
import Points from './Points';
import Logs from './Logs';
import Settings from './Settings';

import WPMenuSync from './WPMenuSync';

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
                    <Route path="*" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;