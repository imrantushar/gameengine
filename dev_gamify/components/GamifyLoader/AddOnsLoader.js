import { Box, Flex, Separator, Skeleton } from "@chakra-ui/react";

const AddOnsLoader = ({ count = 5 }) => {
    return (
        <Flex
            width='100%'
            flexWrap='wrap'
            gap='20px'
            className='gamify-dashboard-addon-cards'
        >
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    p="16px 0"
                    border="1px solid var(--academy-border-color)"
                    borderRadius="6px"
                    bg="white"
                    width="calc((100% / 3) - 16px)"
                >
                    <Box p="0 16px">
                        <Skeleton height="50px" width="64px" mb="8px" />

                        <Skeleton height="20px" width="40%" mb="8px" />

                        <Flex direction="column" gap={1}>
                            <Skeleton height="20px" width="100%" />
                            <Skeleton height="20px" width="80%" />
                        </Flex>

                        <Skeleton height="20px" width="60px" mt="16px" />
                    </Box>

                    <Separator borderColor="var(--gamify-border-color)" m="16px 0" />

                    <Box display="flex" justifyContent="space-between" p="0 16px">
                        <Skeleton height="20px" width="100px" />
                        <Skeleton height="20px" width="40px" borderRadius="4px" />
                    </Box>
                </Box>
            ))}
        </Flex>
    );
};

export default AddOnsLoader;
