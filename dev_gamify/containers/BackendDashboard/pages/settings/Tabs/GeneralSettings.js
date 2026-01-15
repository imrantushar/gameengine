import React, { useEffect } from 'react';
import { Box, Flex, Input, Text, VStack } from '@chakra-ui/react';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import LabeledInput from '@GFComponents/LabeledInput';
import { fetchSettings, setGeneralField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';
import { useFormikContext } from 'formik';

const GeneralSettings = () => {
    const {values, setFieldValue} = useFormikContext();
    const { general } = values;

    return (
        <SettingsInner heading={__("General Settings", "gamify")}>
            <Flex direction="column" gap='16px'>
                <GFLabel type="title" label={__("Level Image Size", "gamify")} />

                <Flex gap='12px'>
                    <GamifyInput label={__("Max Width", "gamify")}>
                        <Input
                            placeholder={__("Enter max width", "gamify")}
                            type="number"
                            value={general?.level_image_width}
                            onChange={(e) => setFieldValue('general.level_image_width', e.target.value )}
                            {...commonInput}
                        />
                    </GamifyInput>

                    <GamifyInput label={__("Max Height", "gamify")}>
                        <Input
                            placeholder={__("Enter max height", "gamify")}
                            type="number"
                            value={general?.level_image_height}
                            onChange={(e) => setFieldValue('general.level_image_height', e.target.value )}
                            {...commonInput}
                        />
                    </GamifyInput>
                </Flex>

                <GFLabel type="subtitle" label={__("Maximum dimensions for ranks featured image.", "gamify")} />
            </Flex>
        </SettingsInner>
    );
};

export default GeneralSettings;
