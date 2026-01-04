import { Box, Table, Flex, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import React from 'react';
import GFLabel from '@GFComponents/Labels/GFLabel';

function TopUsers({ users }) {
    // If no users, show fallback
    if (!users || users.length === 0) {
        return (
            <Box p={6} w='100%' background="var(--gamify-background)" borderRadius="4px">
                <GFLabel type="title" fontWeight="600" fontSize="xl" mb='4' label={__(`Top 5 Users`, 'gamify')} />
                <Text>{__("No data available yet.", "gamify")}</Text>
            </Box>
        );
    }

    return (
        <Box p={6} w='100%' background="var(--gamify-background)" borderRadius="4px">
            <GFLabel type="title" fontWeight="600" fontSize="xl" mb='4' label={__(`Top 5 Users`, 'gamify')} />
            <Table.Root variant="simple">
                <Table.Header>
                    <Table.Row background="var(--gamify-second-primary)">
                        <Table.ColumnHeader width="6.21%" borderLeftRadius="4px" color="var(--gamify-background)" paddingLeft="24px">{__('Rank', 'gamify')}</Table.ColumnHeader>
                        <Table.ColumnHeader width="27.62%" color="var(--gamify-background)">{__('User', 'gamify')}</Table.ColumnHeader>
                        <Table.ColumnHeader width="22.06%" color="var(--gamify-background)">{__('Points', 'gamify')}</Table.ColumnHeader>
                        <Table.ColumnHeader width="22.06%" color="var(--gamify-background)">{__('Achievements', 'gamify')}</Table.ColumnHeader>
                        <Table.ColumnHeader borderRightRadius="4px" width="22.06%" color="var(--gamify-background)">{__('Levels', 'gamify')}</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {users.map((item, index) => (
                        <Table.Row key={index} borderRadius="4px" background={index % 2 === 0 ? 'var(--gamify-background)' : 'var(--gamify-body-background)'}>
                            <Table.Cell borderLeftRadius={index % 2 !== 0 ? '4px' : ''} paddingLeft="24px">
                                <Text as="span" fontSize="14px">#{index + 1}</Text>
                            </Table.Cell>
                            <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{item.name}</Table.Cell>
                            <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{parseInt(item.total_points).toLocaleString()}</Table.Cell>
                            <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''} fontWeight="500">{item.achievements_count}</Table.Cell>
                            <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{item.top_level || '-'}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}

export default TopUsers;