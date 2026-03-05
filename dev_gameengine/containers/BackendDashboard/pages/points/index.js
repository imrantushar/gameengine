import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { API, namespace, route_path } from '@GFUtils/helper';
import PointTypesTable from './PointsTypeTable';
import { GoPlus } from 'react-icons/go';
import ImportDemoBanner from '@GFComponents/ImportDemoBanner';
import { fetchPointTypes } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import WalletTypesTable from '../walletLists/WalletTypeTable';

const Points = () => {
    const [banners, setBanners] = useState(
        window.GameEngineGlobal.banners
    );
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pointTypes } = useSelector((state) => state.pointType);

    const importHandler = async () => {
        await API.post(namespace + 'setup/import-module', {
            module: "points"
        });
        await dispatch(fetchPointTypes({}));
    }
    const closeHandler = async () => {
        await API.post(namespace + 'setup/dismiss-banner', {
            module: "points"
        });
        setBanners(prev => ({
            ...prev,
            points: 'yes',
        }));
    }
    
    return (
        <>
            <TopBar path={__("Points System", "gameengine")} />

            <div className='gameengine-page-content'>
                {(pointTypes.length === 0 && banners?.points !== 'yes') && (
                    <ImportDemoBanner 
                        title={__("No point system found.", 'gameengine')}
                        subtitle={__("Want to quickly get started by importing a default XP currency and login rewards?", 'gameengine')}
                        handleImport={importHandler}
                        handleClose={closeHandler}
                    />
                )}
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Point System", "gameengine")} />

                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${route_path}admin.php?page=gameengine-points&path=points-types`)}
                    >
                        <Icon as={GoPlus} boxSize="20px" /> {__('Add new point System', 'gameengine')}
                    </Button>
                </Flex>

                <PointTypesTable />
            </div>
        </>
    );
};

export default Points;
