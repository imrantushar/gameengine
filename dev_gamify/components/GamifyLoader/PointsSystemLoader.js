import { Box, Flex, Skeleton } from "@chakra-ui/react";
import GamifyBox from "@GFComponents/GamifyBox";
import GamifyInput from "@GFComponents/GamifyInput";
import RequirementsLoader from "./RequirementsLoader";

export const PointsSystemLoader = () => {
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

                <Skeleton height="40px" width="20%" borderRadius="6px" />
            </Flex>

            <GamifyBox dynamicClasses="gamify-points-system" heading={<Skeleton height="20px" width="50%" />}>
                <Flex gap="12px">
                    <GamifyInput label={<Skeleton height="20px" width="50%" />} width="calc(50% - 6px)">
                        <Skeleton height="40px" width="100%" />
                    </GamifyInput>

                    <GamifyInput label={<Skeleton height="20px" width="50%" />} width="calc(50% - 6px)">
                        <Skeleton height="40px" width="100%" />
                    </GamifyInput>
                </Flex>

                <RequirementsLoader />
            </GamifyBox>
        </>
    );
};
