import { Box, Flex, Skeleton } from "@chakra-ui/react";

export const HookSkeleton = () => {
    return (
        <>
            {/* Awards section */}
            <Skeleton height="32px" width="260px" />

            <Flex gap="24px">
                {/* Available Hooks (LEFT) */}
                <Flex
                    width="50%"
                    p="24px"
                    borderRadius="4px"
                    border="1px solid var(--gamify-border-color)"
                    direction="column"
                    gap="16px"
                >
                    {/* Title */}
                    <Skeleton height="20px" width="180px" />
                    <Skeleton height="14px" width="220px" />

                    {/* Filter box */}
                    <Skeleton height="72px" borderRadius="4px" />

                    {/* Hook cards */}
                    <Flex direction="column" gap="8px">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} height="56px" borderRadius="6px" />
                        ))}
                    </Flex>
                </Flex>

                {/* Active Hooks (RIGHT) */}
                <Flex
                    width="50%"
                    p="24px"
                    borderRadius="4px"
                    border="1px solid var(--gamify-border-color)"
                    direction="column"
                    gap="16px"
                >
                    <Skeleton height="20px" width="160px" />

                    {[1, 2].map(i => (
                        <Skeleton key={i} height="96px" borderRadius="6px" />
                    ))}
                </Flex>
            </Flex>
        </>
    )
}

export const PointsSystemLoader = () => {
    return (
        <>
            {/* TopBar */}
            <Flex justify="space-between" align="center" mb={6}>
                <Skeleton height="32px" width="260px" />
                <Skeleton height="40px" width="140px" borderRadius="6px" />
            </Flex>

            <Box width="1174px" margin="0 auto">
                <Flex direction="column" bg="white" p={6} borderRadius="4px" gap={6}>

                    {/* Name inputs */}
                    <Flex gap="24px">
                        <Skeleton height="56px" width="50%" />
                        <Skeleton height="56px" width="50%" />
                    </Flex>

                    <HookSkeleton />

                    {/* Footer button */}
                    <Flex justify="flex-end">
                        <Skeleton height="40px" width="140px" borderRadius="6px" />
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};
