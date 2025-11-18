import { Box, SimpleGrid, Text, Flex, Icon } from "@chakra-ui/react";
import { FiUser, FiAward, FiTrendingUp, FiStar } from "react-icons/fi";
import React from 'react';

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

const Dashboard = () => {


    return (
        <Box w='1320px' margin="0 auto">
            <Box p={6} background="var( --gamify-background)" borderRadius="4px">
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Overview
                </Text>
                <Flex   gap={6}>
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
                                <Text fontSize="2xl" margin="0"  fontWeight="bold">
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
        </Box>
    );
};

export default Dashboard;
