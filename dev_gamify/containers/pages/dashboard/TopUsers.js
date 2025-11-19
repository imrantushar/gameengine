import { Box, Text, Table, Flex } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import React from 'react';
import GFLabel from '@Components/Labels/GFLabel';

function TopUsers(props) {
    const { users } = props
    return (
        <Box p={6} w='100%' background="var( --gamify-background)" borderRadius="4px">
            <GFLabel
                type="title"
                fontWeight="600"
                fontSize="xl"
                mb='4'
                label={__(`Top 5 Users`, 'gamify')}
            />
            <Table.Root variant="simple">
                <Table.Header>
                    <Table.Row background="var(--gamify-second-primary)">
                        <Table.ColumnHeader
                            width="6.21%"
                            borderLeftRadius="4px"
                            color="var(--gamify-background)"
                            paddingLeft="24px"
                        >
                            {__('Rank', 'gamify')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                            width="27.62%"
                            color="var(--gamify-background)"
                        >
                            {__('User', 'gamify')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                            width="22.06%"
                            color="var(--gamify-background)"
                        >
                            {__('Points', 'gamify')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                            width="22.06%"
                            color="var(--gamify-background)"
                        >
                            {__('Achievements', 'gamify')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                            borderRightRadius="4px"
                            width="22.06%"
                            color="var(--gamify-background)"
                        >
                            {__('Levels', 'gamify')}
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {users.map((item, index) => (
                        <Table.Row
                            borderRadius="4px"
                            key={index}
                            background={
                                index % 2 === 0
                                    ? 'var(--gamify-background)'
                                    : 'var(--gamify-body-background)'
                            }
                        >
                            <Table.Cell
                                borderLeftRadius={
                                    index % 2 !== 0 ? '4px' : ''
                                }
                                paddingLeft="24px"
                                textTransform="capitalize"
                            >
                                <Flex direction="column">
                                    <Text as="span" fontSize="14px">
                                        {__(item?.rank, 'gamify')}
                                    </Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell
                                borderRightRadius={
                                    index % 2 !== 0 ? '4px' : ''
                                }
                            >

                                {__(item?.name, 'gamify')}
                            </Table.Cell>
                            <Table.Cell
                                borderRightRadius={
                                    index % 2 !== 0 ? '4px' : ''
                                }
                            >
                                {__(item?.points, 'gamify')}
                            </Table.Cell>
                            <Table.Cell
                                borderRightRadius={
                                    index % 2 !== 0 ? '4px' : ''
                                }
                                fontWeight="500"
                            >
                                {__(item.achievements, 'gamify')}
                            </Table.Cell>
                            <Table.Cell
                                borderRightRadius={
                                    index % 2 !== 0 ? '4px' : ''
                                }
                            >

                                {__(item.level, 'gamify')}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}

export default TopUsers;