import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const BoxView = ({ title, subtitle, children, width = "calc(50% - 8px)", p = "16px", rightContent }) => {
    return (
        <Box boxShadow="var(--gamify-shadow)" borderRadius="4px" width={{ base: "100%", lg: width }} bg="#fff">
            {rightContent ? (
                <Flex justify="space-between" align="center" borderBottom="1px solid var(--gamify-border-color)" padding="16px">
                    {title && (
                        <Text fontSize="20px" fontWeight="600" lineHeight="30px" color="var(--gamity-font-color)" m={0}>
                            {title}
                            {subtitle ? (
                                <Text fontSize="14px" fontWeight="400" lineHeight="20px" color="var(--gamity-font-color)" m={0}>{subtitle}</Text>
                            ) : null}
                        </Text>
                    )}
                    {rightContent}
                </Flex>
            ) : (
                title && (
                    <Text fontSize="20px" fontWeight="600" lineHeight="30px" color="var(--gamity-font-color)" padding="16px" m={0} borderBottom="1px solid var(--gamify-border-color)">
                        {title}
                        {subtitle ? (
                            <Text fontSize="14px" fontWeight="400" lineHeight="20px" color="var(--gamity-font-color)" m={0}>{subtitle}</Text>
                        ) : null}
                    </Text>
                )
            )}

            <Box p={p}>
                {children}
            </Box>
        </Box>
    );
};

export default BoxView;
