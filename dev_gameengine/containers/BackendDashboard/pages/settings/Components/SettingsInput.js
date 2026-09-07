const SettingsInput = ({
    label,
    className,
    children,
    subtitle = null,
}) => {
    const Label = (
        <div className="flex items-center">
            <p className="text-[14px] font-medium leading-5 m-0 text-[var(--gameengine-font-color)]">
                {label}
            </p>
        </div>
    );

    const classes = [
        "flex flex-row justify-between items-center gap-4 w-full border-0",
        className && className
    ].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                {Label}
                {subtitle && (
                    <p className="text-[14px] font-normal leading-5 m-0 text-[var(--gameengine-warn-muted)]">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="shrink-0 flex items-center justify-end w-[260px]">
                {children}
            </div>
        </div>
    );
};

export default SettingsInput;
