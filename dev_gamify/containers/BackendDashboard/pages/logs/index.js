import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { Button, Icon, Flex, Box, } from '@chakra-ui/react';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { GoPlus } from 'react-icons/go';
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

                    <Button {...primaryBtn} onClick={() => modalOpenHandler()}>
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
