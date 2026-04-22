import { Skeleton } from "@GFUtils/ui";
import GameEngineBox from "@GFComponents/GameEngineBox";
import GameEngineInput from "@GFComponents/GameEngineInput";
import TopbarLoader from "./TopbarLoader";
const AchievementFormLoader = () => {
  return <>
      <TopbarLoader />

      <GameEngineBox heading={<Skeleton height="20px" width="50%" />}>
        <div className="flex flex-col gap-6">
          <GameEngineInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="40px" width="100%" />
          </GameEngineInput>

          <GameEngineInput label={<Skeleton height="20px" width="20%" />} desc={<Skeleton height="20px" width="80%" />}>
            <Skeleton height="40px" width="100%" />
          </GameEngineInput>

          <GameEngineInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="40px" width="20%" borderRadius="6px" />
          </GameEngineInput>

          <GameEngineInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="200px" width="100%" />
          </GameEngineInput>

          <GameEngineInput label={<div className="flex items-center gap-2"><Skeleton height="20px" width="20%" /> <Skeleton height="20px" width="5%" /></div>}>
          </GameEngineInput>

          <div className="w-full p-6 rounded [border:1px_solid_var(--gameengine-border-color)]">
            <Skeleton height="32px" width="20%" mb={6} />

            <div className="flex gap-6">
              <div className="flex flex-col w-1/2 p-6 rounded gap-6 [box-shadow:var(--gameengine-shadow)]">
                <Skeleton height="20px" width="20%" />
                <Skeleton height="14px" width="80%" />

                <Skeleton height="72px" borderRadius="4px" />

                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} height="56px" borderRadius="6px" />)}
                </div>
              </div>

              <div className="flex flex-col w-1/2 p-6 rounded gap-6 [box-shadow:var(--gameengine-shadow)]">
                <Skeleton height="20px" width="20%" />
                <Skeleton height="14px" width="80%" />

                {[1, 2].map(i => <Skeleton key={i} height="96px" borderRadius="6px" />)}
              </div>
            </div>
          </div>
        </div>
      </GameEngineBox>
    </>;
};
export default AchievementFormLoader;