import React, { useState } from 'react';
import Welcome from './Pages/Welcome';
import Congratulation from './Pages/Congratulation';
import { Route, Routes } from 'react-router-dom';
import Settings from './Pages/Settings';
import { plugin_root_url, admin_url } from '@GFUtils/helper';
import { IoMdClose } from 'react-icons/io';
import { __ } from '@wordpress/i18n';

const Setup = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-[var(--gameengine-background)] min-h-screen flex flex-col">
      <img
        src={plugin_root_url + 'assets/images/setup_bg.png'}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        alt=""
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="fixed top-5 right-6 z-50 flex items-center justify-center p-1 rounded text-[var(--gameengine-font-color)] hover:bg-[var(--gameengine-secondary-color)] transition-colors duration-200 border-none bg-transparent cursor-pointer"
        aria-label={__('Close setup wizard', 'gameengine')}
      >
        <IoMdClose size={20} />
      </button>

      <div className="relative z-10 flex-1">
        <Routes>
          <Route exact path="/" element={<Welcome />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route path="/congratulation" element={<Congratulation />} />
        </Routes>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div
            className="bg-[var(--gameengine-background)] rounded p-6 max-w-[400px] w-full mx-4 flex flex-col gap-5 shadow-[0_20px_60px_0_rgba(0,0,0,0.15)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gameengine-setup-exit-title"
          >
            <div className="flex flex-col gap-2">
              <h3 id="gameengine-setup-exit-title" className="text-lg font-medium text-[var(--gameengine-heading-color)] m-0">
                {__('Continue without setup?', 'gameengine')}
              </h3>
              <p className="text-sm text-[var(--gameengine-font-color)] m-0 leading-relaxed">
                {__('You can always run the setup wizard again later from the GameEngine Tools.', 'gameengine')}
              </p>
            </div>

            <div className="flex gap-3 justify-end border-0 border-t border-solid border-[var(--gameengine-border-color)] pt-5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-solid border-[var(--gameengine-border-color)] text-[var(--gameengine-font-color)] bg-transparent hover:bg-[var(--gameengine-border-color)] transition-colors duration-200 cursor-pointer"
              >
                {__('Cancel', 'gameengine')}
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = admin_url + 'admin.php?page=gameengine'; }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--gameengine-primary)] text-white border-none hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              >
                {__('Go to dashboard', 'gameengine')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup;
