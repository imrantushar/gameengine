import React, { useEffect, useState } from 'react';
import {
    Flex,
    Box,
    Text,
    Spinner,
    SimpleGrid,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GameEngineBox from '@GFComponents/GameEngineBox';
import WPModal from '@GFComponents/Modal/WPModal';

export default function WheelAnalytics({ wheelId, isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!isOpen || !wheelId) return;

        setLoading(true);
        fetch(`${window.GameEngineGlobal.rest_url}gameengine/v1/lucky-wheels/analytics/${wheelId}`, {
            headers: { 'X-WP-Nonce': window.GameEngineGlobal.nonce },
        })
            .then(res => res.json())
            .then(result => {
                setData(result);
            })
            .catch(err => console.error('Analytics fetch error:', err))
            .finally(() => setLoading(false));
    }, [isOpen, wheelId]);

    return (
        <WPModal 
            isOpen={isOpen} 
            onRequestClose={onClose} 
            title={__('Wheel Analytics & Leads', 'gameengine')}
            size="large"
        >
            {loading ? (
                <Flex justify="center" align="center" h="200px">
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            ) : !data ? (
                <Text textAlign="center">{__('Failed to load analytics.', 'gameengine')}</Text>
            ) : (
                <Flex direction="column" gap={6} p={4}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                        <GameEngineBox p={4} textAlign="center">
                            <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{__('Spins Today', 'gameengine')}</Text>
                            <Text fontSize="2xl" fontWeight="black" color="blue.600">{data.spins_today}</Text>
                        </GameEngineBox>
                        <GameEngineBox p={4} textAlign="center">
                            <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{__('Total Spins', 'gameengine')}</Text>
                            <Text fontSize="2xl" fontWeight="black" color="purple.600">{data.total_spins}</Text>
                        </GameEngineBox>
                        <GameEngineBox p={4} textAlign="center">
                            <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{__('Points Awarded', 'gameengine')}</Text>
                            <Text fontSize="2xl" fontWeight="black" color="green.600">{data.total_points_awarded}</Text>
                        </GameEngineBox>
                        <GameEngineBox p={4} textAlign="center">
                            <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{__('Unique Players', 'gameengine')}</Text>
                            <Text fontSize="2xl" fontWeight="black" color="orange.500">{data.unique_users}</Text>
                        </GameEngineBox>
                    </SimpleGrid>

                    <Flex direction={{ base: "column", lg: "row" }} gap={6}>
                        <Box flex="1">
                            <GameEngineBox heading={__('Prize Distribution', 'gameengine')}>
                                {data.prize_distribution && Object.keys(data.prize_distribution).length > 0 ? (
                                    <Flex direction="column" gap={3} mt={4}>
                                        {Object.entries(data.prize_distribution).map(([prize, count]) => (
                                            <Flex key={prize} justify="space-between" align="center" bg="gray.50" p={3} borderRadius="md" border="1px solid" borderColor="gray.100">
                                                <Text fontWeight="600">{prize}</Text>
                                                <Text fontWeight="bold" color="blue.600">{count} {__('times', 'gameengine')}</Text>
                                            </Flex>
                                        ))}
                                    </Flex>
                                ) : (
                                    <Text color="gray.500" mt={2}>{__('No prizes awarded yet.', 'gameengine')}</Text>
                                )}
                            </GameEngineBox>
                        </Box>

                        <Box flex="1">
                            <GameEngineBox heading={__('Collected Guest Emails (Leads)', 'gameengine')}>
                                {data.guest_emails && data.guest_emails.length > 0 ? (
                                    <Flex direction="column" gap={2} mt={4} maxH="300px" overflowY="auto">
                                        {data.guest_emails.map((item, idx) => (
                                            <Flex key={idx} justify="space-between" align="center" bg="blue.50" p={2} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.400">
                                                <Text fontSize="sm" fontWeight="500">{item.guest_email}</Text>
                                                <Text fontSize="xs" color="gray.500">{new Date(item.created_at).toLocaleDateString()}</Text>
                                            </Flex>
                                        ))}
                                    </Flex>
                                ) : (
                                    <Text color="gray.500" mt={2}>{__('No guest emails collected yet.', 'gameengine')}</Text>
                                )}
                            </GameEngineBox>
                        </Box>
                    </Flex>
                </Flex>
            )}
        </WPModal>
    );
}
