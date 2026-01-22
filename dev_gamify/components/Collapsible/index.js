import React from "react";
import { Box, Flex, Icon, Text, } from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight, LuChevronUp } from "react-icons/lu";
import { FaUndo } from 'react-icons/fa';
import { __, sprintf } from '@wordpress/i18n';
import GFLabel from "@GFComponents/Labels/GFLabel";
import { arrowBackward } from "@GFUtils/icons";

const CustomCollapsible = ({ label, desc, isOpen, onClick, children, singleIcon = false, suffix }) => {
    const classes = [
        'gamify-collapsible',
        suffix && `gamify-collapsible--${suffix}`,
    ].filter(Boolean).join(" ");

    return (
        <>
            <Flex
                padding="12px 16px"
                border="1px solid var(--gamify-border-color)"
                borderRadius="4px"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onClick}
                className={classes}
            >
                <GFLabel
                    type="title"
                    margin={0}
                    padding={0}
                    // translators: %s: label
                    label={sprintf(
                        __('%s', 'gemboards'),
                        label,
                    )}
                    fontWeight="400"
                />

                {!singleIcon ? (
                    <Icon as={isOpen ? LuChevronUp : LuChevronDown} boxSize={5} />
                ) : (
                    <Box
                        bg="#FF3E2F"
                        borderRadius="full"
                        width="24px"
                        height="24px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                    >
                        <Icon as={arrowBackward} boxSize={4} />
                    </Box>
                )}
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
        </>
    );
};

export default CustomCollapsible;
