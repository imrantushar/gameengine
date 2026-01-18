import { Box, Flex, Skeleton } from "@chakra-ui/react";
import GamifyBox from "@GFComponents/GamifyBox";
import GamifyInput from "@GFComponents/GamifyInput";
import RequirementsLoader from "./RequirementsLoader";
import TopbarLoader from "./TopbarLoader";

export const PointsSystemLoader = () => {
    return (
        <>
            <TopbarLoader />

            <GamifyBox dynamicClasses="gamify-points-system" heading={<Skeleton height="20px" width="50%" />}>
                <Flex gap="12px">
                    <GamifyInput label={<Skeleton height="20px" width="50%" />}>
                        <Skeleton height="40px" width="100%" />
                    </GamifyInput>
                </Flex>

                <RequirementsLoader />
            </GamifyBox>
        </>
    );
};
