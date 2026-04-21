import React from 'react';
import { Box, SimpleGrid, Text, Flex, Icon } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { FiUsers, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import GameEngineBox from '@GFComponents/GameEngineBox';

const StatCard = ({ title, value, icon, color }) => (
    <GameEngineBox padding="20px" boxShadow="var(--gameengine-shadow)" border="1px solid var(--gameengine-border-color)">
        <Flex align="center" gap="16px">
            <Box 
                p="12px" 
                borderRadius="10px" 
                bg={`${color}10`} 
                color={color}
            >
                <Icon as={icon} boxSize="24px" />
            </Box>
            <Box>
                <Text fontSize="14px" color="var(--gameengine-warn-muted)" fontWeight="500">
                    {title}
                </Text>
                <Text fontSize="24px" fontWeight="700" color="var(--gameengine-font-color)">
                    {value}
                </Text>
            </Box>
        </Flex>
    </GameEngineBox>
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
            />
            <StatCard 
                title={__('Converted Signup', 'gameengine')} 
                value={stats.converted} 
                icon={FiUserCheck} 
                color="#12B76A" 
            />
            <StatCard 
                title={__('Top Referrer', 'gameengine')} 
                value={stats.top_referrer_name || __('None', 'gameengine')} 
                icon={FiTrendingUp} 
                color="#F79009" 
            />
        </SimpleGrid>
    );
};

export default ReferralsStats;
