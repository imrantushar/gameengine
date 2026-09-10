import React from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { __ } from '@wordpress/i18n';
import GFLabel from "@GFComponents/Labels/GFLabel";
import { arrowBackward } from "@GFUtils/icons";

const CustomCollapsible = ({
        label,
        desc,
        isOpen,
        onClick,
        children,
        singleIcon = false,
        suffix
}) => {
        const classes = ['gameengine-collapsible', suffix && `gameengine-collapsible--${suffix}`].filter(Boolean).join(" ");

        return (
                <div className={`${`${classes + " " + ""} rounded py-3 px-4`}`}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={onClick}>
                                <GFLabel type="title" margin={0} padding={0}
                                        // translators: %s: label
                                        label={label} fontWeight="400" />

                                {!singleIcon ? (
                                        <>{isOpen ? <LuChevronUp size="20px" /> : <LuChevronDown size="20px" />}</>
                                ) : (
                                        <div className="items-center justify-center rounded-full w-6 h-6 flex text-white bg-[var(--gameengine-error-strong)]">
                                                {arrowBackward()}
                                        </div>
                                )}
                        </div>

                        {isOpen && children && (
                                <div className="flex flex-col pt-6 rounded-b">
                                        {children}
                                </div>
                        )}

                        {desc && !isOpen && <p className="text-[var(--gameengine-secondary)] text-sm mt-1.5">
                                {__(desc, 'gameengine')}
                        </p>}
                </div>
        );
};

export default CustomCollapsible;
