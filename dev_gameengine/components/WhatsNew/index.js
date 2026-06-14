import React, { useState } from 'react';
import Drawer from '@GFComponents/Drawer';
import { __ } from '@wordpress/i18n';
import { CHANGELOGS, CHANGELOG_TYPES } from './helper';
import Button from '@GFComponents/Button';
import { TfiAnnouncement } from 'react-icons/tfi';

const MAX_VISIBLE_CHANGES = 5;
const MAX_VISIBLE_VERSIONS = 3;

const WhatsNew = () => {
    const [expandedVersions, setExpandedVersions] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleVersion = (version) => {
        setExpandedVersions((prev) => ({
            ...prev,
            [version]: !prev[version],
        }));
    };

    return (
        <>
            <Button
                label={__("What's New", "gameengine")}
                icon={<TfiAnnouncement />}
                iconPosition="left"
                preset="white"
                border="gray"
                onClick={() => setIsDrawerOpen(true)}
            />

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={__("What's New", 'gameengine')}
            >
                <div className="flex flex-col gap-8">
                    {CHANGELOGS.slice(0, MAX_VISIBLE_VERSIONS).map((release) => {
                        const isExpanded = expandedVersions[release?.version];

                        const visibleChanges = isExpanded
                            ? release?.changes
                            : release?.changes?.slice(0, MAX_VISIBLE_CHANGES);

                        return (
                            <div
                                key={release?.version}
                                className="border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs font-medium bg-[var(--gameengine-primary)] text-white rounded-full uppercase px-3 py-1.5">
                                        {release?.version}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {visibleChanges.map((change, index) => {
                                        const type =
                                            CHANGELOG_TYPES[change?.type];

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3"
                                            >
                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        px-2
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        whitespace-nowrap
                                                        ${type?.bgColor}
                                                        ${type?.textColor}
                                                        min-w-[67px]
                                                    `}
                                                >
                                                    {type?.label}
                                                </span>

                                                <p className="text-[15px] leading-6 text-[#454F59] m-0">
                                                    {change?.text}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {release?.changes?.length >
                                    MAX_VISIBLE_CHANGES && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleVersion(release?.version)
                                        }
                                        className="mt-4 text-[14px] font-normal leading-6 bg-transparent border-0 text-[#22A06B] underline cursor-pointer"
                                    >
                                        {isExpanded
                                            ? __('Show Less', 'gameengine')
                                            : __('Show More...', 'gameengine')}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-2">
                        <a
                            href="https://gameengine.pro/changelog/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-md
                                px-4
                                py-2
                                text-sm
                                font-medium
                                bg-[var(--gameengine-primary)]
                                text-white
                                no-underline
                            "
                        >
                            {__('See All Changelogs', 'gameengine')}
                        </a>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default WhatsNew;
