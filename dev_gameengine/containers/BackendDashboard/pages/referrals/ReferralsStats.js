import React from 'react';
import { Box, SimpleGrid, Text, Flex, Icon } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { FiUsers, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import GameEngineBox from '@GFComponents/GameEngineBox';

const StatCard = ({ title, value, icon, color, bg }) => (
    <Flex 
        align="center" 
        justify="space-between" 
        bg={bg} 
        p="32px 24px" 
        gap={6} 
        boxShadow="var(--gameengine-shadow)" 
        borderRadius="4px"
        flex="1"
    >
        <Flex direction="column" gap={1}>
            <Text fontSize="30px" fontWeight="700" lineHeight="38px" m={0} color="var(--gameengine-font-color)">
                {value}
            </Text>
            <Text fontSize="16px" fontWeight="500" lineHeight="24px" m={0} color="var(--gameengine-font-color)">
                {title}
            </Text>
        </Flex>
        <Box bg={color} p="14px" borderRadius="full">
            <Icon as={icon} boxSize={8} color="#fff" />
        </Box>
    </Flex>
);

const ReferralsStats = () => {
    const { stats } = useSelector(state => state.referrals);

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="24px" mb="24px">
            <StatCard 
                title={__('Total Referrals', 'gameengine')} 
                value={stats.total_referrals} 
                icon={FiUsers} 
                color="#2E90FA" 
                bg="blue.50"
            />
            <StatCard 
                title={__('Converted Signup', 'gameengine')} 
                value={stats.converted} 
                icon={FiUserCheck} 
                color="#12B76A" 
                bg="green.50"
            />
            <StatCard 
                title={__('Top Referrer', 'gameengine')} 
                value={stats.top_referrer_name || __('None', 'gameengine')} 
                icon={FiTrendingUp} 
                color="#F79009" 
                bg="orange.50"
            />
        </SimpleGrid>
    );
};

export default ReferralsStats;
