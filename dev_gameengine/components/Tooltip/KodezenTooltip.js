import { useState } from "react";
import { Popover, Portal } from "@GFUtils/ui";
import "./styles.scss";
export default function KodezenTooltip({
  children,
  openerType = "text",
  // button/ icon
  openerContent,
  variant = "blue",
  placement = "top-center",
  // top-start, top-end, top-center, bottom-start, bottom-end, bottom-center, left-start, left-end, right-start, right-end,
  arrow = "center",
  // center, right, bottom, left, bottom-left, top-left, top-right, bottom-right
  contentWidth = "240px",
  suffix
}) {
  const [visible, setVisible] = useState(false);
  return <Popover.Root open={visible} positioning={{
    placement: placement
  }}>
            <Popover.Trigger asChild>
                {openerType === "text" ? <p className="text-sm font-normal leading-5 break-words text-[var(--gameengine-font-color)]" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                        {openerContent}
                    </p> : <button className="p-0 h-auto break-words [min-width:auto]" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                        {openerContent}
                    </button>}
            </Popover.Trigger>

            <Portal>
                <Popover.Positioner onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
                    {visible && <div className={`${`kodezen-tooltip kodezen-tooltip__variant kodezen-tooltip__variant--${variant} kodezen-tooltip__${suffix}`} relative`}>
                            <Popover.Content className="kodezen-tooltip__content" maxW={contentWidth} wordBreak="break-all">
                                {children}
                            </Popover.Content>

                            <div className={`kodezen-tooltip__arrow kodezen-tooltip__arrow--${arrow}`} />
                        </div>}
                </Popover.Positioner>
            </Portal>
        </Popover.Root>;
}
;