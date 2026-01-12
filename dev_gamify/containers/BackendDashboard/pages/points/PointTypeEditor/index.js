import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
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
import GamifyBox from '@GFComponents/GamifyBox';
import { PointsSystemLoader } from '@GFComponents/GamifyLoader/PointsSystemLoader';

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
        if (allHooks.length === 0) {
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
        } catch (error) { }
        finally {
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            {formLoading ? (
                <PointsSystemLoader />
            ) : (
                <Formik
                    enableReinitialize={true}
                    initialValues={getlPointtypesInitialValues(editId, pointTypes)}
                    onSubmit={onSubmitHandler}
                >
                    {({ submitForm, isSubmitting }) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Points System", "gamify")}
                                    rightContent={
                                        <Button {...primaryBtn} onClick={submitForm} loading={isSubmitting}>
                                            {currentPointTypeId ? __('Update Point System', 'gamify') : __('Save Point System', 'gamify')}
                                        </Button>
                                    }
                                />

                                <GamifyBox dynamicClasses="gamify-points-system" heading={__("Points System", "gamify")}>
                                    <FormInner hooksLoading={hooksLoading} />
                                </GamifyBox>
                            </>
                        )
                    }}
                </Formik>
            )}
        </>
    );
};

export default PointTypeEditor;
