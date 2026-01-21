import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, } from '@chakra-ui/react';
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
import { getPointTypesInitialValues } from './helper';
import FormInner from './FormInner';
import GamifyBox from '@GFComponents/GamifyBox';
import { PointsSystemLoader } from '@GFComponents/GamifyLoader/PointsSystemLoader';

const PointTypeEditor = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');
    const { pointTypes, allHooks } = useSelector((state) => state.pointType);
    const existingItem = pointTypes.find(item => String(item.id) === String(editId));
    const [formLoading, setFormLoading] = useState(!!editId && !existingItem);
    const [hooksLoading, setHooksLoading] = useState(allHooks.length === 0);

    useEffect(() => {
        if (editId && !existingItem) {
            setFormLoading(true);
            dispatch(fetchPointTypeById(editId))
                .finally(() => {
                    setFormLoading(false);
                });
        }
    }, [editId, existingItem, dispatch]);

    useEffect(() => {
        if (allHooks.length === 0) {
            setHooksLoading(true)
            dispatch(fetchTriggers('point_type'))
                .finally(() => {
                    setHooksLoading(false)
                });
        }
    }, [allHooks.length, dispatch]);

    const onSubmitHandler = async (values, actions) => {
        actions.setSubmitting(true);
        try {
            if (editId) {
                const {payload} = await dispatch(updatePointType({ id: editId, data: values }));
                actions.setValues(getPointTypesInitialValues(payload.id, [{...values, id: payload.id}]))
            } else {
                const {payload} = await dispatch(savePointType(values));
                if (payload?.id) {
                    navigate(`${route_path}admin.php?page=gamify-points&action=edit&id=${payload.id}&path=name`, { replace: true });
                    actions.setValues(getPointTypesInitialValues(payload.id, [{...values, id: payload.id}]))
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
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
                    initialValues={getPointTypesInitialValues(editId, pointTypes)}
                    onSubmit={onSubmitHandler}
                >
                    {({ submitForm, isSubmitting, dirty }) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Points System", "gamify")}
                                    rightContent={
                                        <Button minW="170px" maxW="170px" {...primaryBtn} onClick={submitForm} loading={isSubmitting} disabled={!dirty || isSubmitting}>
                                            {isSubmitting ? (
                                                <Spinner
                                                    color="var(--gamify-primary)"
                                                    css={{ "--spinner-track-color": "var(--gamify-secondary)" }}
                                                />
                                            ) : (
                                                editId ? __('Update Point System', 'gamify') : __('Save Point System', 'gamify')
                                            )}
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
