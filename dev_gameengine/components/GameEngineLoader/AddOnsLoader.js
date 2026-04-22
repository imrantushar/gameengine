import { Skeleton } from "@GFUtils/ui";
const AddOnsLoader = ({
  count = 5
}) => {
  return <div className="gameengine-dashboard-addon-cards flex w-full flex-wrap gap-5">
            {Array.from({
      length: count
    }).map((_, i) => <div className="rounded-md bg-white [border:1px_solid_var(--academy-border-color)] py-4" style={{
      "width": "calc((100% / 3) - 16px)"
    }} key={i}>
                    <div className="px-4">
                        <Skeleton height="50px" width="64px" mb="8px" />

                        <Skeleton height="20px" width="40%" mb="8px" />

                        <div className="flex flex-col gap-1">
                            <Skeleton height="20px" width="100%" />
                            <Skeleton height="20px" width="80%" />
                        </div>

                        <Skeleton height="20px" width="60px" mt="16px" />
                    </div>

                    <hr className="[border-color:var(--gameengine-border-color)] my-4" />

                    <div className="justify-between flex px-4">
                        <Skeleton height="20px" width="100px" />
                        <Skeleton height="20px" width="40px" borderRadius="4px" />
                    </div>
                </div>)}
        </div>;
};
export default AddOnsLoader;