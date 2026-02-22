import { Box, Button, Checkbox, Flex, Input, Separator, Switch, Text, VStack, Field, } from '@chakra-ui/react';
import { CiLock } from "react-icons/ci";
import React from 'react';

const Logos = () => {

    return (
        <>
            <Box bg='#fff' width={'400px'} height={'400px'}>
                <Box>

                    <Field.Root disabled>
                        <Field.Label>Enable Gateway</Field.Label>
                        <Field.Label>enable_partial_payment"</Field.Label>
                        <Field.Label>conversion_rate": 100"</Field.Label>
                        
                    </Field.Root>

                    <CiLock />

                    <Button bg='inherit' color={'#000'}>Upgrade to Pro to unlock these settings"</Button>
                </Box>



            </Box>

        </>
    );
};

export default Logos;
