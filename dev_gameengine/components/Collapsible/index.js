import React from "react";
import { Icon } from "@GFComponents/UI";
import { LuChevronDown, LuChevronRight, LuChevronUp } from "react-icons/lu";
import { FaUndo } from 'react-icons/fa';
import { __, sprintf } from '@wordpress/i18n';
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

        return <>
                <div className={`${`${classes + " " + ""} rounded py-3 px-4`} [border:1px_solid_var(--gameengine-border-color)]`} onClick={onClick}>
                        <div className="flex items-center justify-between cursor-pointer">
                                <GFLabel type="title" margin={0} padding={0}
                                        // translators: %s: label
                                        label={sprintf(__('%s', 'gemboards'), label)} fontWeight="400" />

                                {!singleIcon ? <Icon as={isOpen ? LuChevronUp : LuChevronDown} boxSize={5} /> : <div className="items-center justify-center rounded-full w-6 h-6 flex text-white bg-[#FF3E2F]">
                                        <Icon as={arrowBackward} boxSize={4} />
                                </div>}
                        </div>

                        {isOpen && children && <div className="flex flex-col pt-6" borderBottomLeftRadius="4px" borderBottomRightRadius="4px"
                        // marginTop="-2px"
                        >
                                {children}
                        </div>}

                        {desc && !isOpen && <p className="text-[var(--gameengine-secondary)] text-sm mt-1.5">
                                {__(desc, 'gameengine')}
                        </p>}
                </div>

        </>;
};

export default CustomCollapsible;
