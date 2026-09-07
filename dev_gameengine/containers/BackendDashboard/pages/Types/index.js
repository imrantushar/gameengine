import React, { useState } from 'react';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import TypesForm from './TypesForm';
import TypesTable from './TypesTable';
import { capitalizeFirstLetter } from './TypesForm/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import WhatsNew from '@GFComponents/WhatsNew';

const Types = ({
  type
}) => {
  const [formData, setFormData] = useState(null);
  const editHandler = (params = null) => {
    if (params) {
      setFormData(params);
    }
  };
  const resetForm = () => {
    setFormData(null);
  };

  return <>
    <TopBar path={capitalizeFirstLetter(type) + " " + __("Types", "gameengine")} rightContent={<WhatsNew />} />

    <div className='gameengine-page-content'>
      <p className='gameengine-page-heading py-6'>{capitalizeFirstLetter(type) + " " + __("Types", "gameengine")}</p>
    </div>

    <div className="gameengine-page-content items-start flex gap-6 overflow-visible">
      <TypesForm type={type} resetForm={resetForm} formData={formData} />
      <TypesTable type={type} editHandler={editHandler} />
    </div>
  </>;
};

export default Types;
