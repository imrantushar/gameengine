import { Skeleton } from "@GFUtils/ui";
import GameEngineBox from "@GFComponents/GameEngineBox";
import GameEngineInput from "@GFComponents/GameEngineInput";
import RequirementsLoader from "./RequirementsLoader";
import TopbarLoader from "./TopbarLoader";
export const PointsSystemLoader = () => {
  return <>
            <TopbarLoader />

            <GameEngineBox dynamicClasses="gameengine-points-system" heading={<Skeleton height="20px" width="50%" />}>
                <div className="flex gap-3">
                    <GameEngineInput label={<Skeleton height="20px" width="50%" />}>
                        <Skeleton height="40px" width="100%" />
                    </GameEngineInput>
                </div>

                <RequirementsLoader />
            </GameEngineBox>
        </>;
};