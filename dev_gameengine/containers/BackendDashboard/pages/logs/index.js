import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { Icon } from '@GFComponents/UI';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { GoPlus } from 'react-icons/go';
import LogsTable from './LogsTable';
import LogsModal from './LogsModal';
const Logs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const modalOpenHandler = (params = null) => {
    if (params) {
      setFormData({
        ...params
      });
    }
    setIsModalOpen(true);
  };
  const onRequestClose = () => {
    setFormData(null);
    setIsModalOpen(false);
  };
  return <>
    <TopBar path={__("Logs", "gameengine")} />

    <div className='gameengine-page-content'>
      <div className="flex justify-between items-center" style={{
        "padding": "24px 0"
      }}>
        <GFLabel type="plainHeading" margin={0} label={__("Logs", "gameengine")} />
        <button
          style={primaryBtn}
          className="flex items-center gap-2 text-sm shadow-sm font-medium transition-colors"
          onClick={() => modalOpenHandler()}
        >
          <Icon as={GoPlus} color={'#fff'} className="text-lg font-bold" />
          {__('Manual Trigger', 'gameengine')}
        </button>
      </div>
      <LogsTable modalOpenHandler={modalOpenHandler} />
      <LogsModal isModalOpen={isModalOpen} onRequestClose={onRequestClose} formData={formData} />
    </div>
  </>;
};
export default Logs;