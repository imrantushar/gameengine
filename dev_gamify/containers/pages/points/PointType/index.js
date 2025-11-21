import React, { useState } from 'react';
import {
    Box,
    Flex,
    Input,
    Text,
    Collapsible,
    useCollapsible,
    Icon
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@Components/Labels/GFLabel';
import Select from 'react-select';
import { LuChevronDown, LuChevronRight } from "react-icons/lu"
import PointsDailyVisit from './ActionHook/PointsDailyVisit';
import PointsViewingContent from './ActionHook/PointsViewingContent';
import PointsLogins from './ActionHook/PointsLogins';
import PointsPublishingContent from './ActionHook/PointsPublishingContent';
import PointsComments from './ActionHook/PointsComments';
import PointsReferrals from './ActionHook/PointsReferrals';
import PointsBirthday from './ActionHook/PointsBirthday';
import CustomCollapsible from '@Components/Collapsible';

const PointType = (props) => {
    const [open, setOpen] = useState(false);
    const collapsible = useCollapsible()
    const [selectedHook, setSelectedHook] = useState(null);
    const [pointAwards, setPointAwards] = useState(true)
    const [pointDeductions, setDeductions] = useState(false)
    const renderActionHook = (selected) => {
        switch (selected) {
            case "daily-visits":
                return <PointsDailyVisit />;

            case "view-content":
                return <PointsViewingContent />;
            case "points-login":
                return <PointsLogins />;
            case "point-publishing-content":
                return <PointsPublishingContent />;
            case "point-comments":
                return <PointsComments />;
            case "point-referrals":
                return <PointsReferrals />;
            case "point-birthday":
                return <PointsBirthday />;

            default:
                return null;
        }
    }
    return (
        <>
            <Box width="1174px" margin="0 auto" >
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
                        {/* <Input
                        className="gamify-input"
                        type="number"
                        placeholder={__('Academy Lms ', 'gamify')}
                        value={
                            'Academy Lms '
                        }
                    /> */}
                        <Select
                            placeholder={__('Select question type', 'gamify')}
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            options={[
                                { label: 'Academy Lmd', value: 'academy-lmd' },
                            ]}
                            value={{
                                label: 'Academy Lmd', value: 'academy-lmd'
                            }}
                            onChange={(opt) =>
                                console.log(opt)
                            }
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
                        <Flex gap='24px'
                        >
                            <Flex width='50%' p='24px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>

                                <Flex flexDirection='column' gap='24px'>
                                    <Box>
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Available Hooks`, 'gamify')}
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="500"
                                            fontSize="1rem"
                                            label={__(`To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.`, 'gamify')}
                                        />
                                    </Box>
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
                                        isOpen={selectedHook === "daily-visits"}
                                        onClick={() => setSelectedHook("daily-visits")}
                                    />
                                    <CustomCollapsible
                                        label="Points for viewing content"
                                        desc="Award points for viewing content on the website."
                                        isOpen={selectedHook === "view-content"}
                                        onClick={() => setSelectedHook("view-content")}
                                    />

                                    <CustomCollapsible
                                        label="Points for publishing content"
                                        desc="Award points for publishing posts or pages."
                                        isOpen={selectedHook === "point-publishing-content"}
                                        onClick={() => setSelectedHook("point-publishing-content")}
                                    />

                                    <CustomCollapsible
                                        label="Points for comments"
                                        desc="Award points for user comments."
                                        isOpen={selectedHook === "point-comments"}
                                        onClick={() => setSelectedHook("point-comments")}
                                    />

                                    <CustomCollapsible
                                        label="Points for referrals"
                                        desc="Award points for user referrals."
                                        isOpen={selectedHook === "point-referrals"}
                                        onClick={() => setSelectedHook("point-referrals")}
                                    />

                                    <CustomCollapsible
                                        label="Points for birthday"
                                        desc="Award points on user's birthday."
                                        isOpen={selectedHook === "point-birthday"}
                                        onClick={() => setSelectedHook("point-birthday")}
                                    />

                                </Flex>


                            </Flex>
                            <Box width='50%' borderRadius="4px" border='1px solid var(--gamify-border-color)' p='24px'>
                                <Flex flexDirection='column' gap='24px'>
                                    <Box>
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Action Hook`, 'gamify')}
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="500"
                                            fontSize="1rem"
                                            label={__(`The following hooks are used for all users.`, 'gamify')}
                                        />
                                    </Box>
                                    {renderActionHook(selectedHook)}
                                </Flex>


                            </Box>

                        </Flex>
                    )}

                    <CustomCollapsible
                        label="Automatic Point Deductions"
                        isOpen={pointDeductions}
                        onClick={() => setDeductions(!pointDeductions)}
                    />
                    {pointDeductions && (
                        <Flex gap='24px'
                        >
                            <Flex width='50%' p='24px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>

                                <Flex flexDirection='column' gap='24px'>
                                    <Box>
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Available Hooks`, 'gamify')}
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="500"
                                            fontSize="1rem"
                                            label={__(`To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.`, 'gamify')}
                                        />
                                    </Box>
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
                                        isOpen={selectedHook === "daily-visits"}
                                        onClick={() => setSelectedHook("daily-visits")}
                                    />
                                    <CustomCollapsible
                                        label="Points for viewing content"
                                        desc="Award points for viewing content on the website."
                                        isOpen={selectedHook === "view-content"}
                                        onClick={() => setSelectedHook("view-content")}
                                    />

                                    <CustomCollapsible
                                        label="Points for publishing content"
                                        desc="Award points for publishing posts or pages."
                                        isOpen={selectedHook === "point-publishing-content"}
                                        onClick={() => setSelectedHook("point-publishing-content")}
                                    />

                                    <CustomCollapsible
                                        label="Points for comments"
                                        desc="Award points for user comments."
                                        isOpen={selectedHook === "point-comments"}
                                        onClick={() => setSelectedHook("point-comments")}
                                    />

                                    <CustomCollapsible
                                        label="Points for referrals"
                                        desc="Award points for user referrals."
                                        isOpen={selectedHook === "point-referrals"}
                                        onClick={() => setSelectedHook("point-referrals")}
                                    />

                                    <CustomCollapsible
                                        label="Points for birthday"
                                        desc="Award points on user's birthday."
                                        isOpen={selectedHook === "point-birthday"}
                                        onClick={() => setSelectedHook("point-birthday")}
                                    />

                                </Flex>


                            </Flex>
                            <Box width='50%' borderRadius="4px" border='1px solid var(--gamify-border-color)' p='24px'>
                                <Flex flexDirection='column' gap='24px'>
                                    <Box>
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Action Hook`, 'gamify')}
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="500"
                                            fontSize="1rem"
                                            label={__(`The following hooks are used for all users.`, 'gamify')}
                                        />
                                    </Box>
                                    {renderActionHook(selectedHook)}
                                </Flex>


                            </Box>

                        </Flex>
                    )}

                </Flex>
            </Box>
        </>

    );
}

export default PointType;