import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
const DeductsLogins = (props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <CustomCollapsible
            label="Deducts for Logins"
            desc="The user loses points for logging in."
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        >
            <Flex gap='12px' >
                <Flex as="label" direction="column" gap={2} width="30%">
                    <p
                        className='gamify-title'
                    >
                        {__(
                            'Deducts',
                            'gamify'
                        )}
                    </p>
                    <Input
                        className="gamify-input"
                        type="number"
                        placeholder={__('05', 'gamify')}
                    />


                </Flex>
                <Flex as="label" direction="column" gap={2} width="30%">
                    <p
                        className='gamify-title'
                    >
                        {__(
                            'Limit',
                            'gamify'
                        )}
                    </p>
                    <Input
                        className="gamify-input"
                        type="number"
                        placeholder={__('10', 'gamify')}
                    />


                </Flex>
                <Flex as="label" direction="column" gap={2} width="40%" >
                    <p
                        className='gamify-title'
                    >
                        {__(
                            'Point Name',
                            'gamify'
                        )}
                    </p>
                    <Select
                        placeholder={__('Select question type', 'gamify')}
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        options={[
                            { label: 'Unlimited', value: 'unlimited' },
                        ]}
                        value={{
                            label: 'Unlimited', value: 'unlimited'
                        }}
                        onChange={(opt) =>
                            console.log(opt)
                        }
                    />
                </Flex>
            </Flex>
            <Flex
                padding="24px"
                justifyContent='flex-end'>
                <Button
                    {...primaryBtn}
                    width='63px'

                >
                    {__('Save', 'gamify')}
                    <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                </Button>
            </Flex>
        </CustomCollapsible>
    );
}

export default DeductsLogins;