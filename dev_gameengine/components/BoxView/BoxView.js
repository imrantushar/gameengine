import React from 'react';
const BoxView = ({
  title,
  subtitle,
  children,
  width = "calc(50% - 8px)",
  p = "16px",
  rightContent,
  minWidth
}) => {
  return <div className="rounded bg-white [box-shadow:var(--gameengine-shadow)]" style={{
    "minWidth": minWidth,
    "width": width
  }}>
            {rightContent ? <div className="flex justify-between items-center p-4 [border-bottom:1px_solid_var(--gameengine-border-color)]">
                    {title && <p className="text-xl font-semibold m-0 text-[var(--gamity-font-color)] leading-[30px]">
                            {title}
                            {subtitle ? <p className="text-sm font-normal leading-5 m-0 text-[var(--gamity-font-color)]">{subtitle}</p> : null}
                        </p>}
                    {rightContent}
                </div> : title ? <p className="text-xl font-semibold p-4 m-0 text-[var(--gamity-font-color)] [border-bottom:1px_solid_var(--gameengine-border-color)] leading-[30px]">
                        {title}
                        {subtitle ? <p className="text-sm font-normal leading-5 m-0 text-[var(--gamity-font-color)]">{subtitle}</p> : null}
                    </p> : null}

            <div style={{
      "padding": p
    }}>
                {children}
            </div>
        </div>;
};
export default BoxView;