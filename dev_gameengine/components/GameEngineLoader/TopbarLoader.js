import Skeleton from "./Skeleton";

const TopbarLoader = () => {
  return (
    <>
      <div className="flex justify-between w-full mb-6 bg-[var(--gameengine-background)] [border-bottom:1px_solid_var(--gameengine-border-color)] top-8 py-5 px-6">
        <div className="flex items-center gap-2 w-1/2">
          <Skeleton height="36px" width="36px" />
          <div className="w-1 bg-[var(--gameengine-primary)] h-1.5" />
          <Skeleton height="40px" width="40%" borderRadius="6px" />
        </div>

        <Skeleton height="40px" width="10%" borderRadius="6px" />
      </div>
    </>
  );
};

export default TopbarLoader;
