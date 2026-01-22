import React, { useEffect } from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar, FiCalendar, FiMinusCircle } from "react-icons/fi";
import GFLabel from '@GFComponents/Labels/GFLabel';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BoxView from '@GFComponents/BoxView/BoxView';
import { achievement, calendar, star, trophy, user } from '@GFUtils/icons';

function Overview({ data, onFilterChange, startDate, setStartDate, endDate, setEndDate }) {
    const dateOnly = (d) => {
        if (!d) return null;
        const offset = d.getTimezoneOffset();
        const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (startDate && endDate) {
            onFilterChange(dateOnly(startDate), dateOnly(endDate));
        }
    }, [startDate, endDate]);

    const cards = [
        { label: "Points Given", value: data?.points || "0", icon: star, bg: "yellow.50", iconColor: "#F3C838" },
        { label: "Points Deducted", value: data?.points_deducted || "0", icon: FiMinusCircle, bg: "red.50", iconColor: "red.500" },
        { label: "Achievements Given", value: data?.achievements || "0", icon: achievement, bg: "blue.50", iconColor: "#4BC0F8" },
        { label: "Levels Given", value: data?.levels || "0", icon: trophy, bg: "green.50", iconColor: "#46AD92" },
        { label: "Active Users", value: data?.active_users || "0", icon: user, bg: "red.50", iconColor: "#FF9381" },
    ];

    return (
        <>
            <BoxView
                width='100%'
                title={__('Overview', 'gamify')}
                rightContent={
                    <Flex align="center" gap={2} border="1px solid var(--gamify-border-color)" borderRadius="4px" p="10px 12px" cursor="pointer">
                        <Icon as={calendar} />
                        <Flex>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                placeholderText={__('Start date', 'gamify')}
                                dateFormat="MMM dd, yyyy"
                                customInput={
                                    <Text fontSize="14px" fontWeight="400" lineHeight="20px" m="0">
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
                                    <Text fontSize="14px" fontWeight="400" lineHeight="20px" m="0">
                                        {endDate ? endDate.toLocaleDateString() : __('End date', 'gamify')}
                                    </Text>
                                }
                            />
                        </Flex>
                    </Flex>
                }
            >
                <Flex gap="16px" flexWrap="wrap" p={2}>
                    {cards.map((card, i) => (
                        <Flex
                            key={i}
                            align="center"
                            justify="space-between"
                            bg={card?.bg}
                            p="32px 24px"
                            gap={6}
                            flexShrink={0}
                            flexBasis="calc((100% - 48px) / 4)"
                            boxShadow="var(--gamify-shadow)"
                            borderRadius="4px"
                        >
                            <Flex direction="column" gap={1}>
                                <Text fontSize="30px" fontWeight="700" lineHeight="38px" m={0}>{card?.value}</Text>
                                <Text fontSize="16px" fontWeight="500" lineHeight="24px" m={0}>{card?.label}</Text>
                            </Flex>
                            <Box bg={card?.iconColor} p="14px" borderRadius="full">
                                <Icon as={card?.icon} boxSize={8} color="#fff" />
                            </Box>
                        </Flex>
                    ))}
                </Flex>
            </BoxView>
        </>
    );
}

export default Overview;
