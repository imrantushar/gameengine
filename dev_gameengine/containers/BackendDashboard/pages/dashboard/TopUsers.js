import React from 'react';
import { Table } from '@GFComponents/UI';
import { __ } from '@wordpress/i18n';
import BoxView from '@GFComponents/BoxView/BoxView';
const TopUsers = ({
  users
}) => {
  return <BoxView width='100%' title={__('Top 5 Users', 'gameengine')}>
            {!users || users.length === 0 ? <p>{__("No data available yet.", "gameengine")}</p> : <Table.Root variant="simple">
                    <Table.Header>
                        <Table.Row background="var(--gameengine-second-primary)">
                            <Table.ColumnHeader width="6.21%" borderLeftRadius="4px" color="var(--gameengine-background)" paddingLeft="24px">{__('Rank', 'gameengine')}</Table.ColumnHeader>
                            <Table.ColumnHeader width="27.62%" color="var(--gameengine-background)">{__('User', 'gameengine')}</Table.ColumnHeader>
                            <Table.ColumnHeader width="22.06%" color="var(--gameengine-background)">{__('Points', 'gameengine')}</Table.ColumnHeader>
                            <Table.ColumnHeader width="22.06%" color="var(--gameengine-background)">{__('Achievements', 'gameengine')}</Table.ColumnHeader>
                            <Table.ColumnHeader borderRightRadius="4px" width="22.06%" color="var(--gameengine-background)">{__('Levels', 'gameengine')}</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {users.map((item, index) => <Table.Row key={index} borderRadius="4px" background={index % 2 === 0 ? 'var(--gameengine-background)' : 'var(--gameengine-secondary-color)'}>
                                <Table.Cell borderLeftRadius={index % 2 !== 0 ? '4px' : ''} paddingLeft="24px">
                                    <span className="text-sm">#{index + 1}</span>
                                </Table.Cell>
                                <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{item.name}</Table.Cell>
                                <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{parseInt(item.total_points).toLocaleString()}</Table.Cell>
                                <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''} fontWeight="500">{item.achievements_count}</Table.Cell>
                                <Table.Cell borderRightRadius={index % 2 !== 0 ? '4px' : ''}>{item.top_level || '-'}</Table.Cell>
                            </Table.Row>)}
                    </Table.Body>
                </Table.Root>}
        </BoxView>;
};
export default TopUsers;