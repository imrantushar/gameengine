import React, { useEffect } from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FiUser, FiAward, FiTrendingUp, FiStar, FiCalendar, FiMinusCircle } from "react-icons/fi";
import BoxView from '@GFComponents/BoxView/BoxView';
import { achievement, star, trophy, user } from '@GFUtils/icons';
import DateTimePicker from '@GFComponents/DateTimePicker';

function Overview({ data, onFilterChange, startDate, setStartDate, endDate, setEndDate }) {

    useEffect(() => {
        if (startDate && endDate) {
            onFilterChange(startDate, endDate);
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
                title={__('Overview', 'gameengine')}
                rightContent={
                    <Flex align="center" gap={2} border="1px solid var(--gameengine-border-color)" borderRadius="4px" p="10px 12px" cursor="pointer">
                        <Flex w={'100%'} className='custom-datepicker'>
                            <DateTimePicker
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(nd) => {
                                    setStartDate(nd.startDate)
                                    setEndDate(nd.endDate)
                                }}
                                primaryColor="blue"
                                variant='auto-show'
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
                            boxShadow="var(--gameengine-shadow)"
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
