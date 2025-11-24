import React, { useState } from 'react';
import CustomCollapsible from '@Components/Collapsible';
import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';

const PointsLogins=(props)=> {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Box>
            <CustomCollapsible
                label="Points for Logins"
                desc="Award points for logging in."
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                singleIcon={true}
            >
                <Flex gap='12px' >
                    <Flex as="label" direction="column" gap={2}>
                        <p
                            className='gamify-title'
                        >
                            {__(
                                'Points',
                                'gamify'
                            )}
                        </p>
                        <Input
                            className="gamify-input"
                            type="number"
                            placeholder={__('100', 'gamify')}
                        />


                    </Flex>
                    <Flex as="label" direction="column" gap={2} width="100%" >
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
                <Flex as="label" direction="column" gap={2}>
                    <p
                        className='gamify-title'
                    >
                        {__(
                            'Label',
                            'gamify'
                        )}
                    </p>
                    <Input
                        className="gamify-input"
                        type="text"
                        placeholder={__('ABC', 'gamify')}

                    />


                </Flex>
                <Flex as="label" direction="column" gap={2}>
                    <p
                        className='gamify-title'
                    >
                        {__(
                            'Url',
                            'gamify'
                        )}
                    </p>
                    <Input
                        className="gamify-input"
                        type="text"
                        placeholder={__('gdreyt.net', 'gamify')}
                    />


                </Flex>
              <Flex
              padding="24px 0"
              justifyContent='flex-end'>
                  <Button
                    {...primaryBtn}
                    width='63px'

                >
                    {__('Save', 'gamify')}
                </Button>
              </Flex>
            </CustomCollapsible>

        </Box>
    );
}

export default PointsLogins;