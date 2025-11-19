import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar } from "react-icons/fi";
import GFLabel from '@Components/Labels/GFLabel';
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

function Overview(props) {
    return (
        <Box p={6} background="var( --gamify-background)" borderRadius="4px">
            <GFLabel
                type="title"
                label={__('Overview', 'gamify')}
                fontSize="xl"
                fontWeight="600"
                p="16px 0"
                mb="24px"
                borderBottom="1px solid var(--gamify-border-color)"
            />

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
                            <GFLabel
                                type="title"
                                label={__(card.value, 'gamify')}
                                fontSize="3xl"
                                fontWeight="700"
                                color='var(--gamify-font-color)'
                                margin="0"
                            />
                             <GFLabel
                                type="subtitle"
                                label={__(card.label, 'gamify')}
                                fontSize="md"
                                fontWeight="500"
                                color='var(--gamify-font-color)'
                                margin="0"
                            />
                        </Box>


                        <Icon as={card.icon} boxSize={8} color={card.iconColor} />
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}

export default Overview;