import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar, FiCalendar, FiMinusCircle } from "react-icons/fi";
import GFLabel from '@GFComponents/Labels/GFLabel';
import Divider from '@GFComponents/Divider';

function Overview({ data }) {
    const cards = [
        { label: "Points Given", value: data?.points || "0", icon: FiStar, bg: "yellow.50", iconColor: "yellow.500" },
        {
            label: "Points Deducted",
            value: data?.points_deducted || "0",
            icon: FiMinusCircle,
            bg: "red.50",
            iconColor: "red.500"
        },
        { label: "Achievements Given", value: data?.achievements || "0", icon: FiAward, bg: "blue.50", iconColor: "blue.500" },
        { label: "Levels Given", value: data?.levels || "0", icon: FiTrendingUp, bg: "green.50", iconColor: "green.500" },
        { label: "Active Users", value: data?.active_users || "0", icon: FiUser, bg: "red.50", iconColor: "red.500" },
    ];

    return (
        <Box p={6} background="var(--gamify-background)" borderRadius="4px" w="100%">
            <Flex alignItems='center' justifyContent='space-between'>
                <GFLabel type="title" label={__('Overview', 'gamify')} fontSize="xl" fontWeight="600" p="16px 0" mb="24px" borderBottom="1px solid var(--gamify-border-color)" />
                <Box
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="md"
                    p='10px 12px'
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    width="fit-content"
                    height='40px'
                >
                    <Flex align="center" gap={2}>
                        <Icon as={FiCalendar} color="gray.600" boxSize={4} />
                        <Text margin='0' fontSize="sm" color="gray.800" fontWeight="500">
                            Jan 10, 2024 – Jan 25, 2024
                        </Text>
                    </Flex>
                </Box>
            </Flex>

            <Divider margin='16px 0' />
            <Flex gap={4} flexWrap="nowrap">
                {cards.map((card, i) => (
                    <Flex key={i} p={4} rounded="2xl" bg={card.bg} align="center" justify="space-between" shadow="sm" flex="1" minW="200px" h='130px'>
                        <Box>
                            <GFLabel type="title" label={__(card.value, 'gamify')} fontSize="3xl" fontWeight="700" color='var(--gamify-font-color)' margin="0" />
                            <GFLabel type="subtitle" label={__(card.label, 'gamify')} fontSize="md" fontWeight="500" color='var(--gamify-font-color)' margin="0" />
                        </Box>
                        <Icon as={card.icon} boxSize={8} color={card.iconColor} />
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}

export default Overview;