import React from "react";
import { Box } from "@chakra-ui/react";

const Divider = (props) => {
  return (
    <Box
      width="100%"
      height="1px"
      bg="var(--chakra-colors-gray-200)"
      borderRadius="0px"
      {...props}
    />
  );
};

export default Divider;

