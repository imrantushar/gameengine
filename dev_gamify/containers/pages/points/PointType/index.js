import React, { useState } from 'react';
import {
    Box,
    Flex,
    Input,
    Text,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@Components/Labels/GFLabel';
import Select from 'react-select';

import PointsDailyVisit from './ActionHook/PointsDailyVisit';
import PointsViewingContent from './ActionHook/PointsViewingContent';
import PointsLogins from './ActionHook/PointsLogins';
import PointsPublishingContent from './ActionHook/PointsPublishingContent';
import PointsComments from './ActionHook/PointsComments';
import PointsReferrals from './ActionHook/PointsReferrals';
import PointsBirthday from './ActionHook/PointsBirthday';

import CustomCollapsible from '@Components/Collapsible';

const PointType = () => {

    // MULTI-SELECT FOR AWARD HOOKS
    const [selectedAwardHook, setSelectedAwardHook] = useState(['points-login']);

    // SINGLE SELECT FOR DEDUCTION HOOK
    const [selectedDeductHook, setSelectedDeductHook] = useState(null);

    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);

    // MAP ID → COMPONENT
    const renderActionHook = (id) => {
        switch (id) {
            case "daily-visits": return <PointsDailyVisit />;
            case "view-content": return <PointsViewingContent />;
            case "points-login": return <PointsLogins />;
            case "point-publishing-content": return <PointsPublishingContent />;
            case "point-comments": return <PointsComments />;
            case "point-referrals": return <PointsReferrals />;
            case "point-birthday": return <PointsBirthday />;
            default: return null;
        }
    };

    // MULTI SELECT (AWARDS)
    const handleAwardHookSelect = (hook) => {
        if (selectedAwardHook.includes(hook)) {
            // remove
            setSelectedAwardHook(selectedAwardHook.filter(h => h !== hook));
        } else {
            // add
            setSelectedAwardHook([...selectedAwardHook, hook]);
        }
    };

    // SINGLE SELECT (DEDUCT)
    const handleDeductHookSelect = (hook) => {
        setSelectedDeductHook(selectedDeductHook === hook ? null : hook);
    };
    console.log(selectedAwardHook);
    return (
        <Box width="1174px" margin="0 auto">

            <GFLabel
                type="title"
                fontWeight="500"
                fontSize="xl"
                label={__(`Point Types`, 'gamify')}
            />

            <Flex
                width="100%"
                direction="column"
                bg="var(--gamify-background)"
                p={6}
                borderRadius="4px"
                boxShadow="var(--gamify-shadow)"
                gap={6}
            >

                <Flex as="label" direction="column" gap={2}>
                    <Text
                        fontWeight='500'
                        fontSize='0.875rem'
                        margin={0}
                    >
                        {__(
                            'Point Name',
                            'gamify'
                        )}
                    </Text>
                    <Input
                        className="gamify-input"
                        type="number"
                        placeholder={__('Academy Lms ', 'gamify')}

                    />

                </Flex>
                <Flex as="label" direction="column" gap={2}>
                    <Text
                        fontWeight='500'
                        fontSize='0.875rem'
                        margin={0}
                    >
                        {__(
                            'Point Name',
                            'gamify'
                        )}
                    </Text>
                    <Select
                        placeholder={__('Select question type', 'gamify')}
                        className="gamify-select"
                        classNamePrefix="gamify-select"
                        options={[
                            { label: 'Skill Tones', value: 'skill-tones' },
                        ]}
                        value={{
                            label: 'Skill Tones', value: 'skill-tones'
                        }}
                        onChange={(opt) =>
                            console.log(opt)
                        }
                    />
                </Flex>
                <CustomCollapsible
                    label="Automatic Point Awards"
                    isOpen={pointAwards}
                    onClick={() => setPointAwards(!pointAwards)}
                />

                {pointAwards && (
                    <Flex gap="24px">
                        <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                            <Flex flexDirection="column" gap="24px" width='100%'>

                                <GFLabel
                                    type="title"
                                    fontWeight="500"
                                    fontSize="1.25rem"
                                    label={__(`Available Hooks`, 'gamify')}
                                />
                                <Flex as="label" direction="column" gap={2}>
                                    <Box p='24px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                        <Text fontWeight="500" fontSize="0.875rem" margin='0 0 8px 0'>
                                            {__("Filter Hooks Type", "gamify")}
                                        </Text>

                                        <Select
                                            isMulti
                                            placeholder={__("Select hook type", "gamify")}
                                            classNamePrefix="gamify-select"
                                            options={[
                                                { label: "Gamify", value: "gamify" },
                                                { label: "WordPress", value: "wordpress" },
                                            ]}
                                            // value={''}
                                            onChange={(opt) => console.log(opt)}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: "48px",
                                                    borderRadius: "6px",
                                                    borderColor: "#d0d5dd",
                                                    boxShadow: "none",
                                                    "&:hover": {
                                                        borderColor: "#d0d5dd",
                                                    },
                                                }),

                                                multiValue: (base) => ({
                                                    ...base,
                                                    background: "#F8FAFC",
                                                    padding: "2px 6px",
                                                    borderRadius: "6px",
                                                }),

                                                multiValueLabel: (base) => ({
                                                    ...base,
                                                    color: "#1E293B",
                                                    fontSize: "14px",
                                                }),

                                                multiValueRemove: (base) => ({
                                                    ...base,
                                                    color: "#64748B",
                                                    ":hover": {
                                                        backgroundColor: "transparent",
                                                        color: "#334155",
                                                    },
                                                }),
                                            }}
                                        />
                                    </Box>
                                </Flex>
                                <CustomCollapsible
                                    label="Points for daily visits"
                                    desc="Award points for visiting your website on a daily basis."
                                    isOpen={selectedAwardHook.includes("daily-visits")}
                                    onClick={() => handleAwardHookSelect("daily-visits")}
                                />

                                <CustomCollapsible
                                    label="Points for viewing content"
                                    desc="Award points for viewing content."
                                    isOpen={selectedAwardHook.includes("view-content")}
                                    onClick={() => handleAwardHookSelect("view-content")}
                                />

                                <CustomCollapsible
                                    label="Points for publishing content"
                                    desc="Award points for publishing posts."
                                    isOpen={selectedAwardHook.includes("point-publishing-content")}
                                    onClick={() => handleAwardHookSelect("point-publishing-content")}
                                />

                                <CustomCollapsible
                                    label="Points for Logins"
                                    desc="Award points for logging in."
                                    isOpen={selectedAwardHook.includes("points-login")}
                                    onClick={() => handleAwardHookSelect("points-login")}
                                />

                                <CustomCollapsible
                                    label="Points for referrals"
                                    desc="Award points for referrals."
                                    isOpen={selectedAwardHook.includes("point-referrals")}
                                    onClick={() => handleAwardHookSelect("point-referrals")}
                                />

                                <CustomCollapsible
                                    label="Points for birthday"
                                    desc="Award points on user's birthday."
                                    isOpen={selectedAwardHook.includes("point-birthday")}
                                    onClick={() => handleAwardHookSelect("point-birthday")}
                                />

                            </Flex>
                        </Flex>

                        {/* Right Side: SHOW MULTIPLE AWARD HOOKS */}
                        <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                            <Flex flexDirection="column" gap="24px" width='100%'>
                                <GFLabel
                                    type="title"
                                    fontWeight="500"
                                    fontSize="1.25rem"
                                    label={__(`Action Hook`, 'gamify')}
                                />

                                {selectedAwardHook.map((hookId) => (
                                    <Box key={hookId}>
                                        {renderActionHook(hookId)}
                                    </Box>
                                ))}

                            </Flex>
                        </Box>

                    </Flex>
                )}

                <CustomCollapsible
                    label="Automatic Point Deductions"
                    isOpen={pointDeductions}
                    onClick={() => setPointDeductions(!pointDeductions)}
                />

                {pointDeductions && (
                    <Flex gap="24px">

                        {/* Deduction List */}
                        <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                            <Flex flexDirection="column" gap="24px" width='100%'>

                                <GFLabel
                                    type="title"
                                    fontWeight="500"
                                    fontSize="1.25rem"
                                    label={__(`Available Hooks`, 'gamify')}
                                />

                                <CustomCollapsible
                                    label="Points for daily visits"
                                    desc="Deduct points"
                                    isOpen={selectedDeductHook === "daily-visits"}
                                    onClick={() => handleDeductHookSelect("daily-visits")}
                                />

                                <CustomCollapsible
                                    label="Points for viewing content"
                                    desc="Deduct points"
                                    isOpen={selectedDeductHook === "view-content"}
                                    onClick={() => handleDeductHookSelect("view-content")}
                                />

                                <CustomCollapsible
                                    label="Points for publishing content"
                                    desc="Deduct points"
                                    isOpen={selectedDeductHook === "point-publishing-content"}
                                    onClick={() => handleDeductHookSelect("point-publishing-content")}
                                />

                                <CustomCollapsible
                                    label="Points for comments"
                                    desc="Deduct points"
                                    isOpen={selectedDeductHook === "point-comments"}
                                    onClick={() => handleDeductHookSelect("point-comments")}
                                />

                            </Flex>
                        </Flex>

                        {/* Right Deduction Hook Content */}
                        <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                            <Flex flexDirection="column" gap="24px">

                                <GFLabel
                                    type="title"
                                    fontWeight="500"
                                    fontSize="1.25rem"
                                    label={__(`Action Hook`, 'gamify')}
                                />

                                {renderActionHook(selectedDeductHook)}

                            </Flex>
                        </Box>

                    </Flex>
                )}

            </Flex>
        </Box>
    );
};

export default PointType;
