import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Flex,
    Icon,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaChevronRight } from 'react-icons/fa6';

import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';

import {
    fetchTriggers,
    savePointType,
    updatePointType,
    fetchPointTypeById,
} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { Formik } from 'formik';
import { getlPointtypesInitialValues } from './helper';
import FormInner from './FormInner';
import { PointTypeFormSkeleton } from './components/Skeleton';

const PointTypeEditor = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');
    const { currentPointTypeId, pointTypes, allHooks } = useSelector((state) => state.pointType);
    const exitstignItem = pointTypes.find(item => Number(item.id) === Number(editId));
    const [formLoading, setFormLoading] = useState(!exitstignItem);
    const [hooksLoading, setHooksLoading] = useState(allHooks.length === 0);

    useEffect(() => {
        if (exitstignItem) return;
        setFormLoading(true);
        dispatch(fetchPointTypeById(editId))
            .finally(() => {
                setFormLoading(false);
            });
    }, [editId, exitstignItem]);
    
    useEffect(() => {
        if(allHooks.length === 0) {
            setHooksLoading(true)
            dispatch(fetchTriggers('point_type'))
            .finally(() => {
                setHooksLoading(false)
            });
        }
    }, [allHooks.length]);

    const onSubmitHandler = (values, actions) => {
        actions.setSubmitting(true);
        try {
            const action = currentPointTypeId ? updatePointType({ id: currentPointTypeId, data: values }) : savePointType(values);
            const res = dispatch(action);
            if (res.meta.requestStatus === 'fulfilled') {
                actions.setSubmitting(false);
                navigate(`${route_path}admin.php?page=gamify-points`);
            }
        } catch (error) {}
        finally {
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            {formLoading ? (
                <PointTypeFormSkeleton />
            ) : (
                <Formik
                    enableReinitialize={true}
                    initialValues={getlPointtypesInitialValues(editId, pointTypes)}
                    onSubmit={onSubmitHandler}
                >
                    {({values, submitForm, isSubmitting}) => {
                        return (
                            <>
                                <TopBar 
                                    leftContent={() => (
                                        <>
                                            <Box className="gamify-topbar-logo"><svg width="36" height="36" viewBox="0 0 36 36"><rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" /><path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" /></svg></Box>
                                            <Icon as={FaChevronRight} mx={2} />
                                            <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                                        </>
                                    )} 
                                    rightContent={() => (
                                        <Button {...primaryBtn} width='140px' onClick={submitForm} loading={isSubmitting}>
                                            {currentPointTypeId ? __('Update Point Type', 'gamify') : __('Save Point Type', 'gamify')}
                                        </Button>
                                    )} 
                                />

                                <Box width="1174px" margin="0 auto" pb="50px">
                                    <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                                        <FormInner hooksLoading={hooksLoading} />

                                        <Flex py={6} justify='flex-end' borderTop='1px solid var(--gamify-border-color)'>
                                            <Button {...primaryBtn} width='140px' onClick={submitForm} loading={isSubmitting}>
                                                {currentPointTypeId ? __('Update Point Type', 'gamify') : __('Save Point Type', 'gamify')}
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Box>
                            </>
                        )
                    }}
                </Formik>
            )}
        </>
    );
};

export default PointTypeEditor;