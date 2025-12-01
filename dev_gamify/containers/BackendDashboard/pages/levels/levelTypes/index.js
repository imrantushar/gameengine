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
import UnlockSpecialAchievements from "./levelHooks/UnlockSpecialAchievements";
import GamifyEditor from "@Components/editor";

const levelHooks = [
    {
        id: "unlock-special-achievements",
        label: "Unlock a special Achievements",
        subTitle: "Award points for visiting your website on a daily basis..",
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
            minHeight="100%"
            borderRadius="4px"
            border='none'
            transition="all 0.2s"
        >
            {title && (
                <GFLabel type="title" fontWeight="500" fontSize="1rem" label={title} />
            )}

            <Box mt="12px">{children}</Box>
        </Box>
    );
};

const LevelType = () => {
    const [levelHook, setLevelHook] = useState([]);
    const [availableLevel, setAvailableLevel] = useState(
        levelHooks
    );
    const [message, setMessage] = useState("");
    const [achievement, setAchievement] = useState(true);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    const renderActionHook = (id) => {
        switch (id) {
            case "unlock-special-achievements":
                return <UnlockSpecialAchievements />

            default:
                return null;
        }
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const id = active.id;

        // Move → Selected Sidebar
        if (
            availableLevel.some((i) => i.id === id) &&
            over.id === "awards-sidebar"
        ) {
            const item = availableLevel.find((i) => i.id === id);

            setAvailableLevel((prev) => prev.filter((i) => i.id !== id));
            setLevelHook((prev) => [...prev, item.id]);
            return;
        }
        if (levelHook.includes(id) && over.id === "awards-available") {
            setLevelHook((prev) => prev.filter((x) => x !== id));

            const item = levelHooks.find((i) => i.id === id);
            setAvailableLevel((prev) => [...prev, item]);
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
                        label={__(`Level Type`, "gamify")}
                    />

                    <LabeledInput label="Point Name" placeholder="Academy LMS" />
                    <LabeledInput label="Plural Name" placeholder="Plural Name" />
                    <Box>
                        <GFLabel mb='24px' type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
                        <GamifyEditor
                            suffix="congratulations_message"
                            defaultValue={message}
                            saveValueHandler={(html) => {
                                setMessage(html);
                            }}
                            isCustomHTML={false}
                        />
                    </Box>
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Level Requirements`, "gamify")}
                    />
                    <Switch.Root>
                        <Switch.HiddenInput />
                        <Switch.Label>
                            {__("Allow unlock with points", "gamify")}
                        </Switch.Label>
                        <Switch.Control
                            _checked={{ bg: "var(--gamify-primary)" }}
                        />
                    </Switch.Root>
                    <Flex gap="12px">
                        <Box width="50%">
                            <LabeledInput
                                label="Minimum Balance Requirement"
                                placeholder="2000"
                                type="number"
                            />
                        </Box>
                        <Box width="50%">
                            <LabeledInput
                                label="Maximum Balance Requirement"
                                placeholder="1000"
                                type="number"
                            />
                        </Box>

                        <Box width="50%">
                            <GFSelect
                                label="Choose the Points Type"
                                placeholder="Test Point"
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
                                        {availableLevel.map((item) => (
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
                                            {levelHook.map((hookId) => (
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

export default LevelType;
