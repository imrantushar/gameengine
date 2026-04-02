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
            label: __("Frontend Dashboard", "gameengine"),
            key: "dashboard",
            desc: __("Frontend Dashboard settings", "gameengine"),
            icon: general(),
        },
        {
            label: __("Log", "gameengine"),
            key: "log",
            desc: __("Log settings", "gameengine"),
            icon: general(),
        },
        {
            label: __("Ecommrce", "gameengine"),
            key: "economy",
            desc: __("Ecommrce settings", "gameengine"),
            icon: general(),
        },
        {
            label: __("Coupon Generate", "gameengine"),
            key: "marketplace",
            desc: __("Coupon Generate", "gameengine"),
            icon: general(),
        },
        {
            label: __("Payout", "gameengine"),
            key: "payout",
            desc: __("Payout settings", "gameengine"),
            icon: general(),
        },

    ];

    return (
        <Box
            minW="220px"
            bg="#fff"
            boxShadow="var(--gameengine-shadow)"
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
                            bg={isActive ? "var(--gameengine-secondary-color)" : "transparent"}
                            transition="all 0.3s ease-in-out"
                            _hover={{ bg: "#F9FAFB", transition: "all 0.3s ease-in-out" }}
                            onClick={() => navigate(
                                `${route_path}admin.php?page=gameengine-settings&settings=1&tab=${item.key}`
                            )}
                            gap="12px"
                        >
                            <Icon color={isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"} mt={1}>{item?.icon}</Icon>

                            <Box>
                                <Text
                                    fontWeight={isActive ? "600" : "500"}
                                    fontSize="14px"
                                    lineHeight="20px"
                                    color={isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"}
                                    margin='0'
                                >
                                    {item.label}
                                </Text>

                                <Text
                                    fontSize="12px"
                                    fontWeight="400"
                                    lineHeight="16px"
                                    color={isActive ? "var(--gameengine-primary)" : "#738496"}
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
