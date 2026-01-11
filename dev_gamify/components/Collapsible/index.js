import React from "react";
import { Box, Flex, Icon, Text, } from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { FaUndo } from 'react-icons/fa';
import { __, sprintf } from '@wordpress/i18n';

const CustomCollapsible = ({ label, desc, isOpen, onClick, children, singleIcon = false }) => {
    return (
        <Box width="100%">
            <Flex
                padding="10px"
                border="1px solid var(--gamify-border-color)"
                borderRadius="4px"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onClick}
            >
                <Text fontSize="1rem" fontWeight="500" margin={0} display='flex' width='100%' justifyContent='space-between' alignItems='center'>
                    {/* translators: %s: label */}
                    {sprintf(
                        __('%s', 'gemboards'),
                        label,
                    )}

                    {!singleIcon ? (
                        <Icon as={isOpen ? LuChevronRight : LuChevronDown} boxSize={5} />
                    ) : (
                        <Box
                            bg="red.500"
                            borderRadius="full"
                            width="24px"
                            height="24px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                        >
                            <Icon as={FaUndo} boxSize={4} />
                        </Box>
                    )}
                </Text>
            </Flex>

            {isOpen && children && (
                <Flex
                    flexDirection="column"
                    padding="24px 16px"
                    border="1px solid var(--gamify-border-color)"
                    borderTop="none"
                    borderBottomLeftRadius="4px"
                    borderBottomRightRadius="4px"
                    // marginTop="-2px"
                >
                    {children}
                </Flex>
            )}

            {(desc && !isOpen) && (
                <Text fontSize="0.875rem" margin='6px 0 0 0' color='var(--gamify-secondary)'>
                    {__(desc, 'gamify')}
                </Text>
            )}
        </Box>
    );
};

export default CustomCollapsible;
