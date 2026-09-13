import React from 'react';
import Welcome from './Pages/Welcome';
import Congratulation from './Pages/Congratulation';
import { Route, Routes } from 'react-router-dom';
import Settings from './Pages/Settings';
import { plugin_root_url } from '@GFUtils/helper';

const Setup = () => {
  return (
    <div className="bg-[var(--gameengine-background)] min-h-screen flex flex-col">
      <img
        src={plugin_root_url + 'assets/images/setup_bg.png'}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        alt=""
        aria-hidden="true"
      />

      <div className="relative z-10 flex-1">
        <Routes>
          <Route exact path="/" element={<Welcome />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route path="/congratulation" element={<Congratulation />} />
        </Routes>
      </div>
    </div>
  );
};

export default Setup;
