import { Box, Flex, Skeleton } from "@chakra-ui/react";
import TopbarLoader from "./TopbarLoader";
import GameEngineBox from "@GFComponents/GameEngineBox";

const SettingsLoader = () => {
    return (
        <>
            <TopbarLoader />

            <Flex alignItems="flex-start" gap="16px" className='gameengine-page-content'>
                <Flex
                    minW="300px"
                    bg="#fff"
                    p="16px"
                    boxShadow="var(--gameengine-shadow)"
                    borderRadius="6px"
                    direction="column"
                    gap={4}
                >
                    {[1, 2, 3].map(i => (
                        <Flex key={i} alignItems="flex-start" gap={2}>
                            <Skeleton height="20px" width="20px" />
                            
                            <Box width="100%">
                                <Skeleton height="18px" width="70%" mb="6px" />
                                <Skeleton height="14px" width="90%" />
                            </Box>
                        </Flex>
                    ))}
                </Flex>

                <GameEngineBox dynamicClasses="" heading={<Skeleton height="20px" width="50%" />}>
                    <Box mb="16px">
                        <Skeleton height="14px" width="120px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </Box>

                    <Box mb="16px">
                        <Skeleton height="14px" width="140px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </Box>

                    <Box mb="16px">
                        <Skeleton height="14px" width="160px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </Box>
                </GameEngineBox>
            </Flex>
        </>
    );
};

export default SettingsLoader;
