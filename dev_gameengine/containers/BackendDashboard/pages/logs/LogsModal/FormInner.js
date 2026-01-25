import { Flex, Input, Textarea } from '@chakra-ui/react';
import GameEngineInput from '@GFComponents/GameEngineInput';
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
        let params = "";
        if(searchKey) params += `?search=${searchKey}`;
        const response =  await API.get(namespace + 'actions/users' + params);
        setUserOptins({
            isLoading: false,
            options: response.data
        })
    }

    const actionOptions = [
        { label: __('Award Points (+)', 'gameengine'), value: 'award' },
        { label: __('Deduct Points (-)', 'gameengine'), value: 'deduct' },
    ]

    return (
        <Flex direction={'column'} gap={'12px'}>
            <Flex gap={4}>
                <GameEngineInput label={__("User Name", "gameengine")}>
                    <Select
                    classNamePrefix='gameengine-select'
                    className='gameengine-select'
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
                    onInputChange={(inputValue) => {
                        fetchUserOptions(inputValue);
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
            </GameEngineInput>

            <GameEngineInput label={__("Action Type", "gameengine")}>
                <Select
                    classNamePrefix='gameengine-select'
                    className='gameengine-select'
                    defaultValue={actionOptions.find(item => item.value === values?.type)}
                    onChange={(val) => setFieldValue("type", val?.value )}
                    options={actionOptions}
                />
            </GameEngineInput>
        </Flex>

        <Flex gap={4}>
            <GameEngineInput label={__("Points Amount", "gameengine")}>
                <Input
                    placeholder={__("Exp: 50", "gameengine")}
                    type="number"
                    value={values?.points_awarded}
                    onChange={(e) => setFieldValue("points_awarded", e.target.value )}
                    {...commonInput}
                />
            </GameEngineInput>

            {!values?.id && (
                <GameEngineInput label={__("Schedule(Optional)", "gameengine")}>
                    <Input
                        placeholder={__("Exp: 50", "gameengine")}
                        type="datetime-local"
                        value={values?.schedule_date}
                        onChange={(e) => setFieldValue("schedule_date", e.target.value )}
                        {...commonInput}
                    />
                </GameEngineInput>
            )}
        </Flex>

        <GameEngineInput label={__("Description(Optional)", "gameengine")}>
            <Textarea
                placeholder={__("Reason for adjustment...", "gameengine")}
                size="md"
                minH="100px"
                value={values?.message}
                onChange={(e) => setFieldValue('message', e.target.value )}
            />
        </GameEngineInput>
        </Flex>
    );
};

export default FormInner;