import React from "react";
import { __ } from "@wordpress/i18n";
import { Link, useNavigate } from "react-router-dom";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { FiMail } from "react-icons/fi";
import { FiBookOpen } from "react-icons/fi";
import { FiHelpCircle } from "react-icons/fi";
import { route_path } from "@GFUtils/helper";

const LeftBar = () => {
    const navigate = useNavigate();

    const currentTab = "general-settings";

    const menuList = [
        {
            label: __("General", "gamify"),
            key: "general-settings",
            desc: __("Basic plugin settings", "gamify"),
            icon: <FiBookOpen size={20} />,
        },
        {
            label: __("Email Notice", "gamify"),
            key: "email-notice",
            desc: __("User email alerts", "gamify"),
            icon: <FiMail size={20} />,
        },
        {
            label: __("Help/Support", "gamify"),
            key: "help-support",
            desc: __("Basic Service Details", "gamify"),
            icon: <FiHelpCircle size={20} />,
        },
    ];

    return (
        <Box
            w="240px"
            bg="#fff"
            borderRight="1px solid #E5E7EB"
            h="235px"
            pos="sticky"
            top="0"
            display={{ base: "none", lg: "flex" }}
            flexDirection="column"
            borderRadius='4px'

        >
            <VStack padding='16px' width="100%" align="stretch" spacing={0}>
                {menuList.map((item, i) => {
                    const isActive = currentTab === item.key;

                    return (
                        <Flex
                            key={i}
                            align="flex-start"
                            px="20px"
                            py="12px"
                            columnGap="12px"
                            cursor="pointer"
                            bg={isActive ? "#F6F7F8" : "transparent"}
                            color={isActive ? "#F6F7F8" : "#374151"}
                            transition="0.25s ease"
                            _hover={{ bg: "#F9FAFB" }}
                            onClick={() => navigate(
                                `${route_path}admin.php?page=gamify-settings&settings=1&tab=${item.key}`
                            )}


                        >
                            <Box mt="2px" color={isActive ? "#2563EB" : "#6B7280"} opacity={isActive ? 1 : 0.8}>
                                {item.icon}
                            </Box>
                            <Box>
                                <Text
                                    fontWeight={isActive ? "600" : "500"}
                                    fontSize="14px"
                                    color={isActive ? "#2563EB" : "#6B7280"}
                                    margin='0'
                                >
                                    {item.label}
                                </Text>
                                <Text
                                    fontSize="12px"
                                    color={isActive ? "#2563EB" : "#6B7280"}
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
