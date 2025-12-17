import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import Divider from '@GFComponents/Divider';
import LabeledInput from '@GFComponents/LabeledInput';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { fetchSettings, saveSettings, setGeneralField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';

const GeneralSettings = () => {
    const dispatch = useDispatch();
    const { general, saveStatus, status } = useSelector(state => state.settings);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSettings());
        }

        // 🔥 FIX: Reset status when component mounts/unmounts to prevent auto-alert on tab switch
        return () => {
            dispatch(resetSaveStatus());
        };
    }, [dispatch, status]);

    // Handle Save Feedback
    useEffect(() => {
        if (saveStatus === 'saved') {
            alert(__("General settings saved successfully!", "gamify"));
            // Reset immediately after showing alert
            dispatch(resetSaveStatus());
        }
    }, [saveStatus, dispatch]);

    const handleSave = () => {
        dispatch(saveSettings({ general }));
    };

    return (
        <Box bg="var(--gamify-background)" borderRight="1px solid var(--gamify-border-color)" borderRadius='4px' width="802px">
            <VStack padding='32px' width="100%" align="stretch" gap='16px'>
                <GFLabel type="heading" fontWeight="500" label="General Settings" />
                <Divider width='100%' />

                <GFLabel type="inputLevel" label="Level Image Size" fontWeight='500' fontSize='14px' />
                <Box>
                    <Flex gap='64px'>
                        <LabeledInput
                            label="Max Width"
                            type='number'
                            value={general.level_image_width || ''}
                            onChange={(e) => dispatch(setGeneralField({ field: 'level_image_width', value: e.target.value }))}
                            style={{ flexDirection: "row", alignItems: "center" }}
                            inputStyle={{ width: '74px', height: '25px' }}
                        />
                        <LabeledInput
                            label="Max Height"
                            type='number'
                            value={general.level_image_height || ''}
                            onChange={(e) => dispatch(setGeneralField({ field: 'level_image_height', value: e.target.value }))}
                            style={{ flexDirection: "row", alignItems: "center" }}
                            inputStyle={{ width: '74px', height: '25px' }}
                        />
                    </Flex>
                    <Text fontSize="0.875rem" margin='6px 0 0 0' color='var(--gamify-secondary)'>
                        {__('Maximum dimensions for ranks featured image.', 'gamify')}
                    </Text>
                </Box>

                <Flex justifyContent='flex-end'>
                    <Button {...primaryBtn} onClick={handleSave} isLoading={saveStatus === 'saving'}>
                        {__('Save Changes', 'gamify')}
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
};

export default GeneralSettings;