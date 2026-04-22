import React from 'react';
import { Skeleton } from "@GFUtils/ui";
const RequirementsLoader = () => {
  return <>
            <div className="w-full p-6 rounded mt-6 [border:1px_solid_var(--gameengine-border-color)]">
                <Skeleton height="32px" width="20%" />
            </div>

            <div className="w-full p-6 rounded my-6 [border:1px_solid_var(--gameengine-border-color)]">
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
        </>;
};
export default RequirementsLoader;