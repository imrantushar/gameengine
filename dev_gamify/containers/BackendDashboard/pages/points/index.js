import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import PointTypesTable from './PointsTypeTable';
import { GoPlus } from 'react-icons/go';

const Points = () => {
    const navigate = useNavigate();
    
    return (
        <>
            <TopBar path={__("Points System", "gamify")} />

            <div className='gamify-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Point Types", "gamify")} />

                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${route_path}admin.php?page=gamify-points&path=points-types`)}
                    >
                        <Icon as={GoPlus} boxSize="20px" /> {__('Add new point types', 'gamify')}
                    </Button>
                </Flex>

                <PointTypesTable />
            </div>
        </>
    );
};

export default Points;
