import { Box, Flex, Skeleton } from "@chakra-ui/react";
import GameEngineBox from "@GFComponents/GameEngineBox";
import GameEngineInput from "@GFComponents/GameEngineInput";
import RequirementsLoader from "./RequirementsLoader";
import TopbarLoader from "./TopbarLoader";

export const PointsSystemLoader = () => {
    return (
        <>
            <TopbarLoader />

            <GameEngineBox dynamicClasses="gameengine-points-system" heading={<Skeleton height="20px" width="50%" />}>
                <Flex gap="12px">
                    <GameEngineInput label={<Skeleton height="20px" width="50%" />}>
                        <Skeleton height="40px" width="100%" />
                    </GameEngineInput>
                </Flex>

                <RequirementsLoader />
            </GameEngineBox>
        </>
    );
};
