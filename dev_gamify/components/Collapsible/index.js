import React from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { __ } from '@wordpress/i18n';

const CustomCollapsible = ({ label, desc, isOpen, onClick }) => {
    return (
        <Box>
            <Flex
                padding="10px"
                border="1px solid var(--gamify-border-color)"
                borderRadius="4px"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onClick}
            >
                <Text margin='0' fontSize="1rem" fontWeight="500">
                    {__(label, 'gamify')}
                </Text>

                <Icon>
                    {isOpen ? <LuChevronRight /> : <LuChevronDown />}
                </Icon>
            </Flex>

            {desc && (
                <Text margin="0" fontSize="0.875rem" marginTop="6px">
                     {__(desc, 'gamify')}
                </Text>
            )}
        </Box>
    );
};

export default CustomCollapsible;
