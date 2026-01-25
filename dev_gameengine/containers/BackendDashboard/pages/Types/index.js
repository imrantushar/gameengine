import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import TopBar from "@GFComponents/TopBar";
import { __ } from '@wordpress/i18n';
import GameEngineBox from '@GFComponents/GameEngineBox';
import BoxView from '@GFComponents/BoxView/BoxView';
import AchievementsTable from '../achievements/AchievementsTable';
import { Box } from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import TypesForm from './TypesForm';
import TypesTable from './TypesTable';
import { capitalizeFirstLetter } from './TypesForm/helper';

const Types = ({type}) => {
    const [formData, setFormData] = useState(null);

    const editHandler = (params = null) => {
        if(params) {
            setFormData(params);
        }
    }
    
    const resetForm = () => {
        setFormData(null);
    }
    
    return (
        <>
            <TopBar path={capitalizeFirstLetter(type) + " " + __("Types", "gameengine")} />
            <Box
                className='gameengine-page-content'
                display="flex"
                gap={'24px'}
            >
                <TypesForm type={type} resetForm={resetForm} formData={formData} />
                <TypesTable type={type} editHandler={editHandler}/>
            </Box>
        </>
    );
};

export default Types;