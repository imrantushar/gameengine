import React from "react";
import { __ } from "@wordpress/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";
import { FiHelpCircle } from "react-icons/fi";
import { route_path } from "@GFUtils/helper";
import { general, mail } from "@GFUtils/icons";

const LeftBar = () => {
    const navigate = useNavigate();
    const locationQuery = useLocation();
    const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
    const currentTab = tabMatch ? tabMatch[1] : 'general-settings';
    const menuList = [
        {
            label: __("General", "gamify"),
            key: "general-settings",
            desc: __("Basic plugin settings", "gamify"),
            icon: general(),
        },
        {
            label: __("Email Notice", "gamify"),
            key: "email-notice",
            desc: __("User email alerts", "gamify"),
            icon: mail(),
        },
        // {
        //     label: __("Help/Support", "gamify"),
        //     key: "help-support",
        //     desc: __("Basic Service Details", "gamify"),
        // },
    ];

    return (
        <Box
            minW="300px"
            bg="#fff"
            boxShadow="var(--gamify-shadow)"
            pos="sticky"
            top="0"
            display={{ base: "none", lg: "flex" }}
            flexDirection="column"
            borderRadius='4px'
        >
            <VStack padding='8px' width="100%" align="stretch" spacing={0}>
                {menuList.map((item, i) => {
                    const isActive = currentTab === item.key;
                    return (
                        <Flex
                            key={i}
                            align="flex-start"
                            p="8px 16px"
                            cursor="pointer"
                            bg={isActive ? "var(--gamify-secondary-color)" : "transparent"}
                            transition="0.25s ease"
                            _hover={{ bg: "#F9FAFB" }}
                            onClick={() => navigate(
                                `${route_path}admin.php?page=gamify-settings&settings=1&tab=${item.key}`
                            )}
                            gap="12px"
                        >
                            <Icon color={isActive ? "var(--gamify-primary)" : "var(--gamify-font-color)"} mt={1}>{item?.icon}</Icon>

                            <Box>
                                <Text
                                    fontWeight={isActive ? "600" : "500"}
                                    fontSize="14px"
                                    lineHeight="20px"
                                    color={isActive ? "var(--gamify-primary)" : "var(--gamify-font-color)"}
                                    margin='0'
                                >
                                    {item.label}
                                </Text>

                                <Text
                                    fontSize="12px"
                                    fontWeight="400"
                                    lineHeight="16px"
                                    color={isActive ? "var(--gamify-primary)" : "#738496"}
                                    mt="-2px"
                                    margin='0'
                                >
                                    {item.desc}
                                </Text>
                            </Box>
                        </Flex>
                    );
                })}
            </VStack>
        </Box>
    );
};

export default LeftBar;
