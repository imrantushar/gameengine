import { FaLock } from 'react-icons/fa6';
import { __ } from '@wordpress/i18n';

const SettingsInput = ({
    label,
    desc,
    children,
    isPro = false,
    subtitle = null,
    ...props
}) => {
    const ProBadge = isPro && (
        <div className="flex items-center gap-1.5 ml-2">
            <p className="items-center m-0 text-white rounded-sm leading-none uppercase inline-flex bg-[#FFA943] px-1.5 py-[3px] text-[10px]">
                {__('PRO', 'gameengine')}
            </p>
            <FaLock color="orange.400" />
        </div>
    );

    const Label = (
        <div className="flex items-center">
            <p className="text-[14px] font-medium leading-5 m-0 text-[var(--gameengine-font-color)]">
                {label}
            </p>
            {ProBadge}
        </div>
    );

    return (
        <div
            className="flex flex-row justify-between items-center gap-4 w-full border-0"
            {...props}
        >
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
