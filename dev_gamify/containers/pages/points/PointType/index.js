import React, { useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    Input,
    Text,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@Components/Labels/GFLabel';
import Select from 'react-select';
import CustomCollapsible from '@Components/Collapsible';
import PointsDailyVisit from './ActionHook/pointAwards/PointsDailyVisit';
import PointsViewingContent from './ActionHook/pointAwards/PointsViewingContent';
import PointsPublishingContent from './ActionHook/pointAwards/PointsPublishingContent';
import PointsComments from './ActionHook/pointAwards/PointsComments';
import PointsReferrals from './ActionHook/pointAwards/PointsReferrals';
import PointsBirthday from './ActionHook/pointAwards/PointsBirthday';
import PointsLogins from './ActionHook/pointAwards/PointsLogins';
import DeductsBirthday from './ActionHook/pointDeductions/DeductsBirthday';
import DeductsLogins from './ActionHook/pointDeductions/DeductsLogins';
import DeductsComments from './ActionHook/pointDeductions/DeductsComments';
import DeductsDailyVisits from './ActionHook/pointDeductions/DeductsDailyVisits';
import DeductsPublishingContent from './ActionHook/pointDeductions/DeductsPublishingContent';
import DeductsReferrals from './ActionHook/pointDeductions/DeductsReferrals';
import DeductsViewingContent from './ActionHook/pointDeductions/DeductsViewingContent';
import TopBar from '@Components/TopBar';
import { FaArrowRotateRight } from 'react-icons/fa6';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';

const awardHooks = [
    { id: 'daily-visits', label: 'Points for daily visits' },
    { id: 'view-content', label: 'Points for viewing content' },
    { id: 'point-publishing-content', label: 'Points for publishing content' },
    { id: 'points-login', label: 'Points for Logins' },
    { id: 'point-referrals', label: 'Points for referrals' },
    { id: 'point-birthday', label: 'Points for birthday' },
];

const deductHooks = [
    { id: 'deducts-daily-visit', label: 'Deducts for daily visits' },
    { id: 'deducts-view-content', label: 'Deducts for viewing content' },
    { id: 'deducts-login', label: 'Deducts for logins' },
    { id: 'deducts-comments', label: 'Deducts for comments' },
    { id: 'deducts-published-content', label: 'Deducts for publishing content' },
    { id: 'deducts-referrals', label: 'Deducts for referrals' },
    { id: 'deducts-birthday', label: 'Deducts for birthday' },
];

const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
    };
    return (
        <Box
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            padding="12px"
            borderRadius="6px"
            border="1px solid var(--gamify-border-color)"
            background="white"
            marginBottom="8px"
        >
            {children}
        </Box>
    );
};

const DroppableArea = ({ id, children, title }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <Box
            ref={setNodeRef}
            minHeight="120px"
            borderRadius="6px"
            padding="12px"
            border="1px dashed var(--gamify-border-color)"
            background={isOver ? "rgba(79,70,229,0.04)" : "transparent"}
        >
            <GFLabel type="title" fontWeight="500" fontSize="1rem" label={title} />
            <Box marginTop="12px">{children}</Box>
        </Box>
    );
};

const PointType = () => {
    const [selectedAwardHook, setSelectedAwardHook] = useState(['points-login']);
    const [selectedDeductHook, setSelectedDeductHook] = useState(['deducts-login']);
    const [availableAwards, setAvailableAwards] = useState(awardHooks.filter(h => !selectedAwardHook.includes(h.id)));
    const [availableDeductions, setAvailableDeductions] = useState(deductHooks.filter(h => !selectedDeductHook.includes(h.id)));
    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    const renderActionHook = (id) => {
        switch (id) {
            case "daily-visits": return <PointsDailyVisit />;
            case "view-content": return <PointsViewingContent />;
            case "points-login": return <PointsLogins />;
            case "point-publishing-content": return <PointsPublishingContent />;
            case "point-comments": return <PointsComments />;
            case "point-referrals": return <PointsReferrals />;
            case "point-birthday": return <PointsBirthday />;
            case "deducts-birthday": return <DeductsBirthday />;
            case "deducts-login": return <DeductsLogins />;
            case "deducts-comments": return <DeductsComments />;
            case "deducts-daily-visit": return <DeductsDailyVisits />;
            case "deducts-published-content": return <DeductsPublishingContent />;
            case "deducts-view-content": return <DeductsViewingContent />;
            case "deducts-referrals": return <DeductsReferrals />;
            default: return null;
        }
    };
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const id = active.id;
        if (availableAwards.some(i => i.id === id) && over.id === 'awards-sidebar') {
            const item = availableAwards.find(i => i.id === id);
            setAvailableAwards(prev => prev.filter(i => i.id !== id));
            setSelectedAwardHook(prev => [...prev, item.id]);
            return;
        }
        if (selectedAwardHook.includes(id) && over.id === 'awards-available') {
            setSelectedAwardHook(prev => prev.filter(x => x !== id));
            const item = awardHooks.find(i => i.id === id);
            setAvailableAwards(prev => [...prev, item]);
            return;
        }
        if (availableDeductions.some(i => i.id === id) && over.id === 'deductions-sidebar') {
            const item = availableDeductions.find(i => i.id === id);
            setAvailableDeductions(prev => prev.filter(i => i.id !== id));
            setSelectedDeductHook(prev => [...prev, item.id]);
            return;
        }
        if (selectedDeductHook.includes(id) && over.id === 'deduct-available') {
            setSelectedDeductHook(prev => prev.filter(x => x !== id));
            const item = deductHooks.find(i => i.id === id);
            setAvailableDeductions(prev => [...prev, item]);
            return;
        }
    };
    const removeAward = (id) => {
        setSelectedAwardHook(prev => prev.filter(x => x !== id));
        const item = awardHooks.find(i => i.id === id);
        setAvailableAwards(prev => [...prev, item]);
    };
    const removeDeduct = (id) => {
        setSelectedDeductHook(prev => prev.filter(x => x !== id));
        const item = deductHooks.find(i => i.id === id);
        setAvailableDeductions(prev => [...prev, item]);
    };

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                        <span className="gamify-icon gamify-icon--angle-right"></span>
                        <GFLabel as="h2" color="#4F46E5" type="subtitle" fontWeight="medium" label={__("Dashboard", "gamify")} />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto">
                <Flex
                    width="100%"
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
                        label={__(`Point Types`, 'gamify')}
                    />

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
                            type="text"
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
                                'Plural Name',
                                'gamify'
                            )}
                        </Text>
                        <Input
                            className="gamify-input"
                            type="text"
                            placeholder={__('Plural Name ', 'gamify')}

                        />
                    </Flex>
                </Flex>
                <Flex width="100%" direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>

                    {/* POINT AWARDS */}
                    <CustomCollapsible label="Automatic Point Awards" isOpen={pointAwards} onClick={() => setPointAwards(!pointAwards)} />
                    {pointAwards && (
                        <>
                            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                <Flex gap="24px">
                                    {/* AVAILABLE */}
                                    <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Available Hooks`, 'gamify')}
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
                                        <DroppableArea id="awards-available">
                                            {availableAwards.map(item => (
                                                <DraggableItem key={item.id} id={item.id}>
                                                    <Flex justify="space-between" align="center">
                                                        <Text margin='0' fontWeight="600">{item.label}</Text>
                                                        <Box
                                                            bg="green.500"
                                                            borderRadius="full"
                                                            width="24px"
                                                            height="24px"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            color="white"

                                                        >
                                                            <Icon as={FaArrowRotateRight} boxSize={4} />
                                                        </Box>
                                                    </Flex>
                                                </DraggableItem>
                                            ))}
                                        </DroppableArea>
                                    </Flex>

                                    {/* SELECTED */}
                                    <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                        <GFLabel
                                            type="title"
                                            fontWeight="500"
                                            fontSize="1.25rem"
                                            label={__(`Action Hook`, 'gamify')}
                                        />
                                        <DroppableArea id="awards-sidebar">
                                            <Flex direction="column" gap="12px" marginTop="8px">

                                                {selectedAwardHook.map(hookId => (
                                                    <DraggableItem key={hookId} id={hookId}>
                                                        {renderActionHook(hookId)}

                                                    </DraggableItem>
                                                ))}
                                            </Flex>
                                        </DroppableArea>
                                    </Box>
                                </Flex>
                            </DndContext>
                        </>
                    )}

                    {/* POINT DEDUCTIONS */}
                    <CustomCollapsible label="Automatic Point Deductions" isOpen={pointDeductions} onClick={() => setPointDeductions(!pointDeductions)} />
                    {pointDeductions && (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <Flex gap="24px">
                                {/* AVAILABLE */}
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <GFLabel
                                        type="title"
                                        fontWeight="500"
                                        fontSize="1.25rem"
                                        label={__(`Available Hooks`, 'gamify')}
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
                                    <DroppableArea id="deduct-available">
                                        {availableDeductions.map(item => (
                                            <DraggableItem key={item.id} id={item.id}>
                                                <Flex justify="space-between" align="center">
                                                    <Text margin='0' fontWeight="600">{item.label}</Text>
                                                    <Box
                                                        bg="green.500"
                                                        borderRadius="full"
                                                        width="24px"
                                                        height="24px"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        color="white"
                                                    >
                                                        <Icon as={FaArrowRotateRight} boxSize={4} />
                                                    </Box>
                                                </Flex>
                                            </DraggableItem>
                                        ))}
                                    </DroppableArea>
                                </Flex>

                                {/* SELECTED */}
                                <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                      <GFLabel
                                                type="title"
                                                fontWeight="500"
                                                fontSize="1.25rem"
                                                label={__(`Action Hook`, 'gamify')}
                                            />
                                    <DroppableArea id="deductions-sidebar" >
                                        <Flex direction="column" gap="12px" marginTop="8px">
                                          
                                            {selectedDeductHook.map(hookId => (
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

                </Flex>
            </Box>
        </>
    );
};

export default PointType;
