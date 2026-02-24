import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';

const SettingsInput = ({ label, desc, children, width = "100%", isPro = false, ...props }) => {
    return (
        <Flex direction="row" justifyContent="space-between" alignItems="center" gap="6px" width={width} {...props}>
            <Flex>
                <Text fontSize="14px" fontWeight="500" lineHeight="20px" color="var(--gameengine-font-color)" m="0">{label}</Text>
                {isPro && (
                    <Text
                        background="#FFA943"
                        margin={0}
                        marginLeft={'8px'}
                        color="#fff"
                        borderRadius="2px"
                        padding="3px 6px"
                        fontSize="10px"
                        lineHeight="1"
                        textTransform="uppercase"
                        display="inline-flex"
                        alignItems="center"
                    >{__("PRO", 'gameengine')}</Text>
                )}
            </Flex>
            {children}
        </Flex>
    );
};

export default SettingsInput;
