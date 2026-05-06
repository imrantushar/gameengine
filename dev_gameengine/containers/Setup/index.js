import React from 'react';
import Welcome from './Pages/Welcome';
import Congratulation from './Pages/Congratulation';
import { Route, Routes } from 'react-router-dom';
import TopBar from '@GFComponents/TopBar';
import Settings from './Pages/Settings';

const Setup = () => {
  return (
    <div className="bg-white h-[calc(100vh_-_171px)]">
      <TopBar path={'GameEngine'} topPosition="0" />
      <Routes>
        <Route exact path="/" element={<Welcome />} />
        <Route exact path="/settings" element={<Settings />} />
        <Route path="/congratulation" element={<Congratulation />} />
      </Routes>
    </div>
  );
};

export default Setup;
