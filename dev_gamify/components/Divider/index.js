import React from "react";
import { Box } from "@chakra-ui/react";

const Divider = ({ style }) => {
  return (
    <Box
      width="100%"
      height="1px"
      bg="var(--chakra-colors-gray-200)"
      borderRadius="0px"
      {...style}
    />
  );
};

export default Divider;

