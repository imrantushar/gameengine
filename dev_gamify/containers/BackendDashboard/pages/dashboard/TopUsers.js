import React from 'react';
import { Table, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import BoxView from '@GFComponents/BoxView/BoxView';

const TopUsers = ({ users }) => {
    return (
        <BoxView width='100%' title={__('Top 5 Users', 'gamify')}>
            {!users || users.length === 0 ? (
                <Text>{__("No data available yet.", "gamify")}</Text>
            ) : (
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
                            <Table.Row key={index} borderRadius="4px" background={index % 2 === 0 ? 'var(--gamify-background)' : 'var(--gamify-secondary-color)'}>
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
            )}
        </BoxView>
    );
}

export default TopUsers;
