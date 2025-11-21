import React from "react";
import { Box, Flex , Icon, Text,  } from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { __ } from '@wordpress/i18n';

const CustomCollapsible = ({ label, desc, isOpen, onClick, children }) => {
    return (
        <Box width="100%">
            {/* Header */}
            <Flex
                padding="10px"
                border="1px solid var(--gamify-border-color)"
                borderRadius="4px"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onClick}
            >
                <Text fontSize="1rem" fontWeight="500" margin={0}>
                    {__(label, 'gamify')}
                </Text>
                <Icon as={isOpen ?  LuChevronRight : LuChevronDown} boxSize={5} />
            </Flex>
            {isOpen && children && (
                <Flex
                    flexDirection="column"
                    gap="12px"
                    padding="16px"
                    border="1px solid var(--gamify-border-color)"
                    borderRadius="4px"
                >
                    {children}
                </Flex>
            )}
            {desc && (
                <Text fontSize="0.875rem" marginTop="6px">
                    {__(desc, 'gamify')}
                </Text>
            )}

        </Box>
    );
};

export default CustomCollapsible;
