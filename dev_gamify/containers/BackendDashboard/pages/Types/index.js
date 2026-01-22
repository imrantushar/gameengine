import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import GamifyBox from '@GFComponents/GamifyBox';
import BoxView from '@GFComponents/BoxView/BoxView';
import AchievementsTable from '../achievements/AchievementsTable';
import { Box } from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import TypesForm from './TypesForm';
import TypesTable from './TypesTable';
import { capitalizeFirstLetter } from './TypesForm/helper';

const Types = ({type}) => {
    
    return (
        <>
            <TopBar path={capitalizeFirstLetter(type) + " " + __("Types", "gamify")} />
            <Box
                className='gamify-page-content'
                display="flex"
                gap={'24px'}
            >
                <TypesForm type={type} />
                <TypesTable type={type}/>
            </Box>
        </>
    );
};

export default Types;