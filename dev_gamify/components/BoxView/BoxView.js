import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const BoxView = ({title, subtitle, children, width = "calc(50% - 8px)", p = "16px"}) => {
    return (
        <Box border="1px solid var(--gamify-border-color)" borderRadius="4px" width={{ base: "100%", lg: width }} bg="#fff">
            {title && (
                <Text fontSize="16px" fontWeight="500" lineHeight="24px" m={0} color="var(--gamify-font-color)" padding="16px" borderBottom="1px solid var(--gamify-border-color)">
                    {title}
                    {subtitle ? (
                        <Text fontSize="14px" fontWeight="400" lineHeight="20px" color="var(--gamify-font-color)">{subtitle}</Text>
                    ) : null}
                </Text>
            )}
            
            <Box p={p}>
                {children}
            </Box>
        </Box>
    );
};

export default BoxView;
