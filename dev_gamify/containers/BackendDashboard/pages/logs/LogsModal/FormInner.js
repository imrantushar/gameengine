import { Flex, Input, Textarea } from '@chakra-ui/react';
import GamifyInput from '@GFComponents/GamifyInput';
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { useFormikContext } from 'formik';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import { API, namespace } from '@GFUtils/helper';

const FormInner = () => {
    const { values, setFieldValue } = useFormikContext();
    const [userOptions, setUserOptins] = useState({
        options: [],
        isLoading: false
    })

    const fetchUserOptions = async (searchKey) => {
        setUserOptins({
            ...userOptions,
            isLoading: true
        })
        const params = searchKey ? `?search=${searchKey}` : "";
        const response =  await API.get(namespace + 'actions/users' + params);
        setUserOptins({
            isLoading: false,
            options: response.data
        })
    }

    const actionOptions = [
        { label: __('Award Points (+)', 'gamify'), value: 'award' },
        { label: __('Deduct Points (-)', 'gamify'), value: 'deduct' },
    ]

    return (
        <Flex direction={'column'} gap={'12px'}>
            <Flex gap={4}>
                <GamifyInput label={__("User ID", "gamify")}>
                    <Select
                    classNamePrefix='gamify-select'
                    className='gamify-select'
                    placeholder="e.g. 1"
                    options={userOptions?.options}
                    value={userOptions?.options.find(opt => Number(opt.value) === Number(values?.user_id))}
                    onChange={(selected) =>
                        setFieldValue(
                            "user_id",
                            selected.value
                        )
                    }
                    onMenuOpen={fetchUserOptions}
                    const handleInputChange={(inputValue, { action }) => {
                        if (action === 'input-change') {
                            fetchUserOptions(inputValue);
                        }
                        return inputValue;
                    }}
                    isDisabled={values?.id}
                    isLoading={userOptions.isLoading}
                    styles={{
                        container: (base) => ({
                            ...base,
                            width: "100%",
                            opacity: values?.id ? 0.6 : 1,
                        }),
                    }}
                />
            </GamifyInput>

            <GamifyInput label={__("Action Type", "gamify")}>
                <Select
                    classNamePrefix='gamify-select'
                    className='gamify-select'
                    defaultValue={actionOptions.find(item => item.value === values?.type)}
                    onChange={(val) => setFieldValue("type", val?.value )}
                    options={actionOptions}
                />
            </GamifyInput>
        </Flex>

        <Flex gap={4}>
            <GamifyInput label={__("Points Amount", "gamify")}>
                <Input
                    placeholder={__("Exp: 50", "gamify")}
                    type="number"
                    value={values?.points_awarded}
                    onChange={(e) => setFieldValue("points_awarded", e.target.value )}
                    {...commonInput}
                />
            </GamifyInput>

            {!values?.id && (
                <GamifyInput label={__("Schedule(Optional)", "gamify")}>
                    <Input
                        placeholder={__("Exp: 50", "gamify")}
                        type="datetime-local"
                        value={values?.schedule_date}
                        onChange={(e) => setFieldValue("schedule_date", e.target.value )}
                        {...commonInput}
                    />
                </GamifyInput>
            )}
        </Flex>

        <GamifyInput label={__("Description(Optional)", "gamify")}>
            <Textarea
                placeholder={__("Reason for adjustment...", "gamify")}
                size="md"
                minH="100px"
                value={values?.message}
                onChange={(e) => setFieldValue('message', e.target.value )}
            />
        </GamifyInput>
        </Flex>
    );
};

export default FormInner;