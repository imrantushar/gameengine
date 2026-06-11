import React from 'react';
import Welcome from './Pages/Welcome';
import Congratulation from './Pages/Congratulation';
import { Route, Routes } from 'react-router-dom';
import TopBar from '@GFComponents/TopBar';
import Settings from './Pages/Settings';
import { plugin_root_url } from '@GFUtils/helper';

const Setup = () => {
  return (
    <div className="bg-white h-[calc(100vh_-_171px)]">
      <div className='px-6 py-5 mb-6 border-0 border-b border-solid border-[var(--gameengine-border-color)]'>
        <img className="h-auto max-w-[120px]" src={plugin_root_url + 'assets/images/logo-text.svg'} />
      </div>
      <Routes>
        <Route exact path="/" element={<Welcome />} />
        <Route exact path="/settings" element={<Settings />} />
        <Route path="/congratulation" element={<Congratulation />} />
      </Routes>
    </div>
  );
};

export default Setup;
