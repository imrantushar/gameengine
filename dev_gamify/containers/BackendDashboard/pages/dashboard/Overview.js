import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar, FiCalendar, FiMinusCircle } from "react-icons/fi";
import GFLabel from '@GFComponents/Labels/GFLabel';
import Divider from '@GFComponents/Divider';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Overview({ data, onFilterChange }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Helper to format date as YYYY-MM-DD
    const dateOnly = (d) => {
        if (!d) return null;
        const offset = d.getTimezoneOffset();
        const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    // Trigger filter when both dates are selected
    useEffect(() => {
        if (startDate && endDate) {
            onFilterChange(dateOnly(startDate), dateOnly(endDate));
        }
    }, [startDate, endDate]);

    const cards = [
        { label: "Points Given", value: data?.points || "0", icon: FiStar, bg: "yellow.50", iconColor: "yellow.500" },
        { label: "Points Deducted", value: data?.points_deducted || "0", icon: FiMinusCircle, bg: "red.50", iconColor: "red.500" },
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
                    p="10px 12px"
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    height="40px"
                >
                    <Flex align="center" gap={2}>
                        <Icon as={FiCalendar} color="gray.600" boxSize={4} />
                        <Flex>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                placeholderText={__('Start date', 'gamify')}
                                dateFormat="MMM dd, yyyy"
                                customInput={
                                    <Text fontSize="sm" fontWeight="500" m="0">
                                        {startDate ? startDate.toLocaleDateString() : __('Start date', 'gamify')}
                                    </Text>
                                }
                            />
                            <Text fontSize="sm" fontWeight="500" margin='0 4px' color="gray.500">-</Text>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                placeholderText={__('End date', 'gamify')}
                                dateFormat="MMM dd, yyyy"
                                minDate={startDate}
                                customInput={
                                    <Text fontSize="sm" fontWeight="500" m="0">
                                        {endDate ? endDate.toLocaleDateString() : __('End date', 'gamify')}
                                    </Text>
                                }
                            />
                        </Flex>
                    </Flex>
                </Box>
            </Flex>

            <Divider margin='16px 0' />
            <Flex gap={4} flexWrap="nowrap">
                {cards.map((card, i) => (
                    <Flex key={i} p={4} rounded="2xl" bg={card.bg} align="center" justify="space-between" shadow="sm" flex="1" minW="200px" h='130px'>
                        <Box>
                            <GFLabel type="title" label={card.value} fontSize="3xl" fontWeight="700" color='var(--gamify-font-color)' margin="0" />
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