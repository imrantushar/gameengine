import { useState } from "react";
import { Box, Button, Popover, Portal, Text } from "@chakra-ui/react";
import "./styles.scss";

export default function KodezenTooltip ({
    children,
    openerType = "text", // button/ icon
    openerContent,
    variant = "blue",
    placement = "top-center", // top-start, top-end, top-center, bottom-start, bottom-end, bottom-center, left-start, left-end, right-start, right-end,
    arrow = "center", // center, right, bottom, left, bottom-left, top-left, top-right, bottom-right
    contentWidth = "240px",
    suffix,
}) {
    const [visible, setVisible] = useState(false);

    return (
        <Popover.Root open={visible} positioning={{ placement: placement }}>
            <Popover.Trigger asChild>
                {openerType === "text" ? (
                    <Text
                        fontSize="14px"
                        fontWeight="400"
                        lineHeight="20px"
                        color="var(--gameengine-font-color)"
                        wordBreak="break-word"
                        onMouseEnter={() => setVisible(true)}
                        onMouseLeave={() => setVisible(false)}
                    >
                        {openerContent}
                    </Text>
                ) : (
                    <Button
                        variant="plain"
                        p="0"
                        minWidth="auto"
                        height="auto"
                        size="sm"
                        focusRing="none"
                        wordBreak="break-word"
                        onMouseEnter={() => setVisible(true)}
                        onMouseLeave={() => setVisible(false)}
                    >
                        {openerContent}
                    </Button>
                )}
            </Popover.Trigger>

            <Portal>
                <Popover.Positioner
                    onMouseEnter={() => setVisible(true)}
                    onMouseLeave={() => setVisible(false)}
                >
                    {visible && (
                        <Box
                            position="relative"
                            className={`kodezen-tooltip kodezen-tooltip__variant kodezen-tooltip__variant--${variant} kodezen-tooltip__${suffix}`}
                        >
                            <Popover.Content
                                className="kodezen-tooltip__content"
                                maxW={contentWidth}
                                wordBreak="break-all"
                            >
                                {children}
                            </Popover.Content>

                            <Box
                                className={`kodezen-tooltip__arrow kodezen-tooltip__arrow--${arrow}`}
                            />
                        </Box>
                    )}
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
};