import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import WPModal from '@GFComponents/Modal/WPModal';
import { FiEdit, FiClock } from "react-icons/fi";
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Icon, Badge, Flex, Spinner, Text, Input, Textarea, Box, } from '@chakra-ui/react';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { GoPlus } from 'react-icons/go';
import GamifyInput from '@GFComponents/GamifyInput';
import LogsTable from './LogsTable';
import LogsModal from './LogsModal';

const Logs = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(null);

    const modalOpenHandler = (params = null) => {
        if(params) {
            setFormData({...params})
        }

        setIsModalOpen(true);
    };

    return (
        <>
            <TopBar path={__("Logs", "gamify")} />

            <Box className='gamify-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Logs", "gamify")} />

                    <Button {...primaryBtn} onClick={modalOpenHandler}>
                        <Icon as={GoPlus} boxSize="20px" />  {__('Manual Trigger', 'gamify')}
                    </Button>
                </Flex>
                <LogsTable modalOpenHandler={modalOpenHandler} />
                <LogsModal 
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    formData={formData}
                />
            </Box>

            
        </>
    );
};

export default Logs;
