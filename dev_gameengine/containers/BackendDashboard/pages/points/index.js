import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@GFUtils/ui';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import { API, namespace, route_path } from '@GFUtils/helper';
import PointTypesTable from './PointsTypeTable';
import { GoPlus } from 'react-icons/go';
import ImportDemoBanner from '@GFComponents/ImportDemoBanner';
import { fetchPointTypes } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
const Points = () => {
  const [banners, setBanners] = useState(window.GameEngineGlobal.banners);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    pointTypes
  } = useSelector(state => state.pointType);
  const importHandler = async () => {
    await API.post(namespace + 'setup/import-module', {
      module: "points"
    });
    await dispatch(fetchPointTypes({}));
  };
  const closeHandler = async () => {
    await API.post(namespace + 'setup/dismiss-banner', {
      module: "points"
    });
    setBanners(prev => ({
      ...prev,
      points: 'yes'
    }));
  };
  return <>
    <TopBar path={__("Points System", "gameengine")} />

    <div className='gameengine-page-content'>
      {pointTypes.length === 0 && banners?.points !== 'yes' && <ImportDemoBanner title={__("No point system found.", 'gameengine')} subtitle={__("Want to quickly get started by importing a default XP currency and login rewards?", 'gameengine')} handleImport={importHandler} handleClose={closeHandler} />}
      <div className="flex justify-between items-center py-6 px-1">
        <h2 className="text-xl md:text-2xl font-[500] text-gray-800 m-0">
          {__("Point System", "gameengine")}
        </h2>

        <button 
        style={primaryBtn}
          className="flex items-center gap-2 text-sm shadow-sm font-medium transition-colors"
          onClick={() => navigate(`${route_path}admin.php?page=gameengine-points&path=points-types`)}
        >
          <Icon as={GoPlus} className="text-lg font-bold" />
          {__('Add new point System', 'gameengine')}
        </button>
      </div>

      <PointTypesTable />
    </div>
  </>;
};
export default Points;