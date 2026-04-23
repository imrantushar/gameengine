import { Menu, Portal } from "@GFComponents/UI";
import { useState } from "react";
const CustomTooltip = ({
  children,
  button
}) => {
  const [visible, setVisible] = useState(false);
  return <Menu.Root open={visible} positioning={{
    placement: "top"
  }}>
            <Menu.Trigger asChild>
                <button className="p-0 h-auto [min-width:auto]" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                    {button}
                </button>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                    <Menu.Content bg="var(--gameengine-primary)" color="#fff" maxW="240px" wordBreak="break-all">
                        {children}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>;
};
export default CustomTooltip;