import { Box, Flex, Skeleton } from "@chakra-ui/react";

const TopbarLoader = () => {
    return (
        <>
            <Flex
                direction={{ base: 'column', md: 'row' }}
                justifyContent="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                bg="var(--gamify-background)"
                boxShadow={'var(--gamify-shadow)'}
                width="100%"
                top="32px"
                mb="24px"
                p="20px 24px"
            >
                <Flex align="center" gap={2} width="50%">
                    <Skeleton height="36px" width="36px" />
                    <Box width="4px" height="6px" bg="var(--gamify-primary)" />
                    <Skeleton height="40px" width="40%" borderRadius="6px" />
                </Flex>

                <Skeleton height="40px" width="10%" borderRadius="6px" />
            </Flex>
        </>
    );
};

export default TopbarLoader;
