import { Skeleton } from "@GFComponents/UI";
import TopbarLoader from "./TopbarLoader";
import GameEngineBox from "@GFComponents/GameEngineBox";
const SettingsLoader = () => {
  return <>
            <TopbarLoader />

            <div className="gameengine-page-content flex items-start gap-4">
                <div className="flex flex-col bg-white p-4 rounded-md gap-4 [box-shadow:var(--gameengine-shadow)] min-w-[300px]">
                    {[1, 2, 3].map(i => <div className="flex items-start gap-2" key={i}>
                            <Skeleton height="20px" width="20px" />
                            
                            <div className="w-full">
                                <Skeleton height="18px" width="70%" mb="6px" />
                                <Skeleton height="14px" width="90%" />
                            </div>
                        </div>)}
                </div>

                <GameEngineBox dynamicClasses="" heading={<Skeleton height="20px" width="50%" />}>
                    <div className="mb-4">
                        <Skeleton height="14px" width="120px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </div>

                    <div className="mb-4">
                        <Skeleton height="14px" width="140px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </div>

                    <div className="mb-4">
                        <Skeleton height="14px" width="160px" mb="6px" />
                        <Skeleton height="40px" borderRadius="6px" />
                    </div>
                </GameEngineBox>
            </div>
        </>;
};
export default SettingsLoader;