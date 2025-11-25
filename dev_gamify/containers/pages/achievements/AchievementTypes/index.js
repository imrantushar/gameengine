import React, { useState } from "react";
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import GFLabel from "@Components/Labels/GFLabel";
import Select from "react-select";
import CustomCollapsible from "@Components/Collapsible";
import TopBar from "@Components/TopBar";
import { FaArrowRotateRight } from "react-icons/fa6";

import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";

import LabeledInput from "@Components/LabeledInput";
import { primaryBtn } from "../../../../../assets/scss/chakra/recipe";
import Divider from "@Components/Divider";
import { Switch } from "@chakra-ui/react";
import GFSelect from "@Components/Select";
import UnlockAllAchievementOfType from "./AchievementHook.js/UnlockAllAchievementOfType";
import GetSpecificAchievementRevoked from "./AchievementHook.js/GetSpecificAchievementRevoked";
import UnlockSpecificAchievement from "./AchievementHook.js/UnlockSpecificAchievement";
import GetAddedToAnyRole from "./AchievementHook.js/GetAddedToAnyRole";
import ExpendAmountOfPoints from "./AchievementHook.js/ExpendAmountOfPoints";

const achievementHooks = [
    {
        id: "unlock-all-achievement-of-type",
        label: "Unlock all Achievement of type",
        subTitle: "Award points for visiting your website on a daily basis.",
    },
    {
        id: "get-specific-achievement-revoked",
        label: "Get a specific achievement revoked",
        subTitle: "Award points for viewing content.",
    },
    {
        id: "get-any-achievement-of-type-revoked",
        label: "Get any achievement of type revoked",
        subTitle: "Award points for logging in.",
    },
    {
        id: "unlock-specific-achievement",
        label: "Unlock a specific achievement",
        subTitle: "Award points for publishing content.",
    },
    {
        id: "get-added-to-any-role",
        label: "Get added to any role",
        subTitle: "Award points for making comments.",
    },
    {
        id: "expend-amount-of-points",
        label: "Expend an amount of points",
        subTitle: "Reward users with points on their birthday.",
    },
];

const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
    };

    return (
        <Box ref={setNodeRef} {...listeners} {...attributes} style={style} background="white" mb="8px">
            {children}
        </Box>
    );
};

const DroppableArea = ({ id, children, title }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <Box
            ref={setNodeRef}
            minHeight="295px"
            background={isOver ? "rgba(79,70,229,0.04)" : "transparent"}
        >
            {title && (
                <GFLabel type="title" fontWeight="500" fontSize="1rem" label={title} />
            )}

            <Box mt="12px">{children}</Box>
        </Box>
    );
};

const AchievementsType = () => {
    const [achievementHook, setAchievementHook] = useState([]);
    const [availableAchievement, setAvailableAchievement] = useState(
        achievementHooks
    );
    const [achievement, setAchievement] = useState(true);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    const renderActionHook = (id) => {
        switch (id) {
            case "unlock-all-achievement-of-type":
                return <UnlockAllAchievementOfType />;

            case "get-specific-achievement-revoked":
                return <GetSpecificAchievementRevoked />;

            case "get-any-achievement-of-type-revoked":
                return <GetSpecificAchievementRevoked />;

            case "unlock-specific-achievement":
                return <UnlockSpecificAchievement />;

            case "get-added-to-any-role":
                return <GetAddedToAnyRole />;

            case "expend-amount-of-points":
                return <ExpendAmountOfPoints />;

            default:
                return null;
        }
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const id = active.id;

        // Move → Selected Sidebar
        if (
            availableAchievement.some((i) => i.id === id) &&
            over.id === "awards-sidebar"
        ) {
            const item = availableAchievement.find((i) => i.id === id);

            setAvailableAchievement((prev) => prev.filter((i) => i.id !== id));
            setAchievementHook((prev) => [...prev, item.id]);
            return;
        }
        if (achievementHook.includes(id) && over.id === "awards-available") {
            setAchievementHook((prev) => prev.filter((x) => x !== id));

            const item = achievementHooks.find((i) => i.id === id);
            setAvailableAchievement((prev) => [...prev, item]);
            return;
        }
    };

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                        <span className="gamify-icon gamify-icon--angle-right"></span>
                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="medium"
                            label={__("Game Engine", "gamify")}
                        />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto">
                <Flex
                    direction="column"
                    bg="var(--gamify-background)"
                    p={6}
                    borderRadius="4px"
                    boxShadow="var(--gamify-shadow)"
                    gap={6}
                >
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Achievement Types`, "gamify")}
                    />

                    <LabeledInput label="Point Name" placeholder="Academy LMS" />
                    <LabeledInput label="Plural Name" placeholder="Plural Name" />

                    <Box>
                        <LabeledInput label="Earned By" placeholder="Completing Steps" />
                        <GFLabel
                            type="miniTitle"
                            label={__("How this achievement can be earned.", "gamify")}
                            fontSize="0.875rem"
                            mt="6px"
                            color="var(--gamify-secondary)"
                        />
                    </Box>

                    <Box>
                        <LabeledInput
                            label="Maximum Earnings Per User :"
                            placeholder="0"
                        />
                        <GFLabel
                            type="miniTitle"
                            label={__(
                                "Number of times a user can earn this badge (0 = unlimited).",
                                "gamify"
                            )}
                            fontSize="0.875rem"
                            mt="6px"
                            color="var(--gamify-secondary)"
                        />
                    </Box>

                    <Flex>
                        <Switch.Root>
                            <Switch.HiddenInput />
                            <Switch.Label>
                                {__("Allow unlock with points", "gamify")}
                            </Switch.Label>
                            <Switch.Control
                                _checked={{ bg: "var(--gamify-primary)" }}
                            />
                        </Switch.Root>
                    </Flex>

                    <Flex gap="12px">
                        <Box width="50%">
                            <LabeledInput
                                label="Points"
                                placeholder="1500"
                                type="number"
                            />
                        </Box>

                        <Box width="50%">
                            <GFSelect
                                label="Choose the Points Type"
                                placeholder="Choose one"
                                items={[
                                    { label: "React.js", value: "react" },
                                    { label: "Vue.js", value: "vue" },
                                    { label: "Angular", value: "angular" },
                                    { label: "Svelte", value: "svelte" },
                                ]}
                            />
                        </Box>
                    </Flex>

                    <CustomCollapsible
                        label="Achievement Requirements"
                        isOpen={achievement}
                        onClick={() => setAchievement(!achievement)}
                    />

                    {achievement && (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <Flex gap="24px">
                                <Flex
                                    width="50%"
                                    p="24px"
                                    borderRadius="4px"
                                    border="1px solid var(--gamify-border-color)"
                                    direction="column"
                                    gap="24px"
                                >
                                    <Flex direction="column" gap="12px">
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Available Hooks`, "gamify")}
                                            margin='0'
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="400"
                                            fontSize="12px"
                                            lineHeight="16px"
                                            color="var(--gamify-font-color)"
                                            margin='0'
                                            label={__(
                                                `To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.`,
                                                "gamify"
                                            )}
                                        />
                                        <Flex as="label" direction="column" gap={2}>
                                            <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
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
                                    </Flex>

                                    <DroppableArea id="awards-available">
                                        {availableAchievement.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <DraggableItem id={item.id}>
                                                    <Box
                                                        p="12px"
                                                        borderRadius="6px"
                                                        border="1px solid var(--gamify-border-color)"
                                                    >
                                                        <Flex justify="space-between" align="center">
                                                            <Text margin='0' fontWeight="600">{item.label}</Text>
                                                            <Box
                                                                bg="green.500"
                                                                borderRadius="full"
                                                                w="24px"
                                                                h="24px"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                color="white"
                                                            >
                                                                <Icon as={FaArrowRotateRight} boxSize={4} />
                                                            </Box>
                                                        </Flex>
                                                    </Box>
                                                </DraggableItem>

                                                <Text
                                                    fontSize="0.875rem"
                                                    mt="6px"
                                                    mb="24px"
                                                    color="var(--gamify-secondary)"
                                                >
                                                    {__(item.subTitle, "gamify")}
                                                </Text>
                                            </React.Fragment>
                                        ))}
                                    </DroppableArea>
                                </Flex>
                                <Box
                                    width="50%"
                                    borderRadius="4px"
                                    border="1px solid var(--gamify-border-color)"
                                    p="24px"
                                >
                                    <Flex direction="column" gap="12px">
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Action Hook`, "gamify")}
                                            margin='0'
                                        />
                                        <GFLabel
                                            type="subtitle"
                                            fontWeight="400"
                                            fontSize="12px"
                                            lineHeight="16px"
                                            margin='0'
                                            color="var(--gamify-font-color)"
                                            label={__(
                                                `These hooks will run automatically for all users.`,
                                                "gamify"
                                            )}
                                        />
                                    </Flex>

                                    <DroppableArea id="awards-sidebar">
                                        <Flex direction="column" gap="12px" mt="8px">
                                            {achievementHook.map((hookId) => (
                                                <DraggableItem key={hookId} id={hookId}>
                                                    {renderActionHook(hookId)}
                                                </DraggableItem>
                                            ))}
                                        </Flex>
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        </DndContext>
                    )}

                    <Flex
                        py="24px"
                        justifyContent="flex-end"
                        borderTop="1px solid var(--gamify-border-color)"
                    >
                        <Button {...primaryBtn} width="121px">
                            {__("Save Changes", "gamify")}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default AchievementsType;
