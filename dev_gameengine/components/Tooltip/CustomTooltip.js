import { Button, Menu, Portal } from "@chakra-ui/react";
import { useState } from "react";

const CustomTooltip = ({ children, button }) => {
    const [visible, setVisible] = useState(false);

    return (
        <Menu.Root open={visible} positioning={{ placement: "top", }}>
            <Menu.Trigger asChild>
                <Button
                    variant="plain"
                    p="0"
                    minWidth="auto"
                    height="auto"
                    size="sm"
                    focusRing="none"
                    onMouseEnter={() => setVisible(true)}
                    onMouseLeave={() => setVisible(false)}
                >
                    {button}
                </Button>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner
                    onMouseEnter={() => setVisible(true)}
                    onMouseLeave={() => setVisible(false)}
                >
                    <Menu.Content bg="var(--gameengine-primary)" color="#fff" maxW="240px" wordBreak="break-all">
                        {children}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};

export default CustomTooltip;
