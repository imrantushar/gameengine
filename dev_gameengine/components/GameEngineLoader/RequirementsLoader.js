import React from 'react';
import { Box, Flex, Skeleton } from "@chakra-ui/react";

const RequirementsLoader = () => {
    return (
        <>
            <Box
                padding="24px"
                border="1px solid var(--gameengine-border-color)"
                borderRadius="4px"
                width="100%"
                mt="24px"
            >
                <Skeleton height="32px" width="20%" />
            </Box>

            <Box
                padding="24px"
                border="1px solid var(--gameengine-border-color)"
                borderRadius="4px"
                width="100%"
                m="24px 0"
            >
                <Skeleton height="32px" width="20%" mb={6} />

                <Flex gap="24px">
                    <Flex width="50%" p="24px" borderRadius="4px" boxShadow="var(--gameengine-shadow)" direction="column" gap="24px">
                        <Skeleton height="20px" width="20%" />
                        <Skeleton height="14px" width="80%" />

                        <Skeleton height="72px" borderRadius="4px" />

                        <Flex direction="column" gap="8px">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} height="56px" borderRadius="6px" />
                            ))}
                        </Flex>
                    </Flex>

                    <Flex width="50%" p="24px" borderRadius="4px" boxShadow="var(--gameengine-shadow)" direction="column" gap="24px">
                        <Skeleton height="20px" width="20%" />
                        <Skeleton height="14px" width="80%" />

                        {[1, 2].map(i => (
                            <Skeleton key={i} height="96px" borderRadius="6px" />
                        ))}
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default RequirementsLoader;
