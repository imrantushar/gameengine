import GameEngineBox from "@GFComponents/GameEngineBox";
import Skeleton from "./Skeleton";

const HookListSkeleton = ({
  items = 4
}) => <div className="flex flex-col gap-3">
    {Array.from({
      length: items
    }).map((_, i) => <Skeleton key={i} height="56px" borderRadius="4px" />)}
  </div>;

const HookSidebarSkeleton = ({
  items = 2
}) => <div className="flex flex-col gap-4">
    {Array.from({
      length: items
    }).map((_, i) => <Skeleton key={i} height="110px" borderRadius="6px" />)}
  </div>;

const LevelsFormSkeleton = () => {
  return <>
    <div className="flex justify-between items-center mb-6 p-5">
      <Skeleton height="32px" width="260px" />
      <Skeleton height="40px" width="140px" borderRadius="6px" />
    </div>
    <GameEngineBox dynamicClasses="gameengine-achievements">
      <div className="flex flex-col gap-6">
        {/* Title + Plural */}
        <div className="flex gap-3">
          <Skeleton height="56px" width="50%" />
          <Skeleton height="56px" width="50%" />
        </div>

        {/* Max earnings */}
        <Skeleton height="56px" />

        {/* Achievement Type */}
        <div>
          <Skeleton height="20px" width="200px" mb="12px" />
          <Skeleton height="64px" borderRadius="4px" />
          <Skeleton height="32px" width="160px" mt="12px" />
        </div>

        {/* Congratulations Editor */}
        <div>
          <Skeleton height="20px" width="240px" mb="12px" />
          <Skeleton height="140px" borderRadius="6px" />
        </div>

        {/* Unlock with points */}
        <Skeleton height="32px" width="260px" />

        {/* Requirements Section */}
        <div className="p-6 rounded [border:1px_solid_var(--gameengine-border-color)]">
          <Skeleton height="24px" width="260px" mb="16px" />

          <div className="flex gap-6">
            {/* Available hooks */}
            <div className="flex flex-col w-1/2 gap-4">
              <Skeleton height="20px" width="180px" />
              <Skeleton height="72px" borderRadius="4px" />
              <HookListSkeleton />
            </div>

            {/* Active hooks */}
            <div className="flex flex-col w-1/2 gap-4">
              <Skeleton height="20px" width="160px" />
              <HookSidebarSkeleton />
            </div>
          </div>
        </div>
      </div>
    </GameEngineBox>
  </>;
};

export default LevelsFormSkeleton;
