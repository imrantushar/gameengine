"use client";

import { Portal, Select, createListCollection } from "@chakra-ui/react";

const GFSelect = ({
  label = "Select option",
  placeholder = "Select option",
  items = [],
  size = "sm",
  width = "100%",
}) => {
  const collection = createListCollection({ items });

  return (
    <Select.Root marginTop="2px" collection={collection} size={size} width={width}>
      <Select.HiddenSelect />

      <Select.Label>{label}</Select.Label>

      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>

        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default GFSelect;
