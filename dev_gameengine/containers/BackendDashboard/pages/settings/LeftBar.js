import React from "react";
import { __ } from "@wordpress/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Badge, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";
import { FaLock } from "react-icons/fa6";
import { is_pro, route_path } from "@GFUtils/helper";
import { general, license, mail } from "@GFUtils/icons";

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
        {
            label: __("Referral", "gameengine"),
            key: "referral",
            desc: __("Referral & Affiliate Systems", "gameengine"),
            icon: general(),
            is_pro: true,
        },
        ...(is_pro
            ? [{
                label: __("License", "gameengine"),
                key: "license",
                desc: __("Manage your license key", "gameengine"),
                icon: license(),
            }]
            : []),
        {
            label: __("Email Templates", "gameengine"),
            key: "email_templates",
            desc: __("Customize Email Templates & Cron", "gameengine"),
            icon: mail(),
        },

    ];

    return (
        <Box
            minW="300px"
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
                                <Flex align="center" gap="8px">
                                    <Text
                                        fontWeight={isActive ? "600" : "500"}
                                        fontSize="14px"
                                        lineHeight="20px"
                                        color={isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"}
                                        margin='0'
                                    >
                                        {item.label}
                                    </Text>
                                    {!is_pro && item.is_pro && (
                                        <Badge
                                            colorScheme="orange"
                                            borderRadius="full"
                                            px="8px"
                                            py="1px"
                                            fontSize="10px"
                                            fontWeight="600"
                                            display="inline-flex"
                                            alignItems="center"
                                            gap="4px"
                                        >
                                            <Icon as={FaLock} boxSize="12px" />
                                            PRO
                                        </Badge>
                                    )}
                                </Flex>

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
