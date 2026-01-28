export const primaryBtn = {
    bg: "var(--gameengine-primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "20px",
    border: "1px solid var(--gameengine-primary)"
}

export const xCloseBtn = {
    size: "xs" ,
    color: "var(--gameengine-font-color)" ,
    bg: "transparent" ,
    border: "1px solid var(--gameengine-border-color)" ,
    _hover: {bg: "var(--gameengine-secondary-color)"},
}

export const primaryClearBtn = {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--gameengine-primary)",
    background: "transparent",
    padding: "0",
    height: "auto",
}

export const outlineBtn = {
    bg: "transparent",
    color: "var(--gameengine-font-color)",
    borderColor: "var(--gameengine-border-color)",
    borderWidth: "1px",
}

export const removeBtn = {
    bg: "var(--gameengine-placing)",
    color: "#fff",
}

export const transparentMiniBtn = {
    bg: "transparent",
    fontSize: "12px",
    color: "var(--gameengine-font-color)",
    borderColor: "var(--gameengine-border-color)",
    borderWidth: "1px",
    padding: "2px 8px",
    lineHeight: "16px",
    height: "auto",
    variant: "outline",
}

export const clearBtn = {
    bg: "transparent",
    fontSize: "12px",
    color: "var(--gameengine-font-color)",
    height: "auto",
    padding: "0"
}

export const commonInput = {
    color: "var(--gameengine-font-color) !important",
    borderColor: "var(--gameengine-border-color) !important",
    outline: "var(--gameengine-primary)",
    _placeholder: {
        color: "#738496 !important",
        opacity: 1
    },
    _active: {
        borderColor: "var(--gameengine-primary) !important"
    },
    _focus: {
        borderColor: "var(--gameengine-primary) !important",
        boxShadow: "0 0 0 1px var(--gameengine-primary) !important"
    },
    _hover: {
        borderColor: "var(--gameengine-primary) !important"
    }
}
