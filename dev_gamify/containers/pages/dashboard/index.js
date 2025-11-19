import {
    Box, Flex, Icon,
    Text,
    VStack,
} from "@chakra-ui/react";
import { FiUser, FiAward, FiTrendingUp, FiStar } from "react-icons/fi";
import { __ } from '@wordpress/i18n';
import React from 'react';
import TopUsers from "./TopUsers";

const cards = [
    {
        label: "Points Given",
        value: "12,000",
        icon: FiStar,
        bg: "yellow.50",
        iconColor: "yellow.500",
    },
    {
        label: "Achievements Given",
        value: "64",
        icon: FiAward,
        bg: "blue.50",
        iconColor: "blue.500",
    },
    {
        label: "Levels Given",
        value: "64",
        icon: FiTrendingUp,
        bg: "green.50",
        iconColor: "green.500",
    },
    {
        label: "Active Users",
        value: "192",
        icon: FiUser,
        bg: "red.50",
        iconColor: "red.500",
    },
];
const users = [
    { rank: "#1", name: "Christopher Hayes", points: "10,000", achievements: 5, level: "Diamond" },
    { rank: "#2", name: "Nicholas Grant", points: "9,400", achievements: 4, level: "Platinum" },
    { rank: "#3", name: "Alexander Pierce", points: "9,200", achievements: 4, level: "Platinum" },
    { rank: "#4", name: "Nathaniel Brooks", points: "8,000", achievements: 2, level: "Gold" },
    { rank: "#5", name: "Frederick Adams", points: "6,000", achievements: 1, level: "Silver" },
];
const Dashboard = () => {


    return (
        <VStack gap='24px' w='1320px' margin="0 auto" >
            <Box p={6} background="var( --gamify-background)" borderRadius="4px">
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    {__('Overview', 'gamify')}
                </Text>
                <Flex gap={6}>
                    {cards.map((card, i) => (
                        <Flex
                            key={i}
                            p={5}
                            rounded="2xl"
                            bg={card.bg}
                            align="center"
                            justify="space-between"
                            shadow="sm"
                            w='300px'
                            h='130px'
                        >
                            <Box>
                                <Text fontSize="2xl" margin="0" fontWeight="bold">
                                    {card.value}
                                </Text>
                                <Text fontSize="sm" margin={0} color="gray.600">
                                    {card.label}
                                </Text>
                            </Box>


                            <Icon as={card.icon} boxSize={8} color={card.iconColor} />
                        </Flex>
                    ))}
                </Flex>
            </Box>
            <TopUsers users={users}/>
            

        </VStack>
    );
};

export default Dashboard;
