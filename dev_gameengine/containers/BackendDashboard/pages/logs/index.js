import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { Icon } from '@GFComponents/UI';
import Button from '@GFComponents/Button';
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
        <Button
          label={__('Manual Trigger', 'gameengine')}
          icon={<Icon as={GoPlus} color={'#fff'} className="text-lg font-bold" />}
          onClick={() => modalOpenHandler()}
        />
      </div>
      <LogsTable modalOpenHandler={modalOpenHandler} />
      <LogsModal isModalOpen={isModalOpen} onRequestClose={onRequestClose} formData={formData} />
    </div>
  </>;
};
export default Logs;