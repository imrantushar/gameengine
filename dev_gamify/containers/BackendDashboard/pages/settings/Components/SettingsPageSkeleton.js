import { Box, Flex, Skeleton, SkeletonText } from "@chakra-ui/react";

const SettingsPageSkeleton = () => {
  return (
    <>
      {/* TopBar */}
      <Flex justify="space-between" align="center" mb="16px" padding={'12px 16px'}>
        <Skeleton height="28px" width="180px" />
        <Skeleton height="40px" width="140px" borderRadius="6px" />
      </Flex>

      <Flex alignItems="flex-start" gap="16px">
        {/* Left Sidebar */}
        <Box
          width="260px"
          p="16px"
          border="1px solid var(--gamify-border-color)"
          borderRadius="6px"
          bg="white"
        >
          {[1, 2, 3].map(i => (
            <Box key={i} mb="16px">
              <Skeleton height="18px" width="70%" mb="6px" />
              <Skeleton height="14px" width="90%" />
            </Box>
          ))}
        </Box>

        {/* Right Content */}
        <Box
          flex="1"
          p="24px"
          border="1px solid var(--gamify-border-color)"
          borderRadius="6px"
          bg="white"
        >
          {/* Section title */}
          <Skeleton height="22px" width="240px" mb="24px" />

          {/* Form fields */}
          <Box mb="16px">
            <Skeleton height="14px" width="120px" mb="6px" />
            <Skeleton height="40px" borderRadius="6px" />
          </Box>

          <Box mb="16px">
            <Skeleton height="14px" width="140px" mb="6px" />
            <Skeleton height="40px" borderRadius="6px" />
          </Box>

          <Box mb="16px">
            <Skeleton height="14px" width="160px" mb="6px" />
            <Skeleton height="40px" borderRadius="6px" />
          </Box>

          <Box mb="16px">
            <Skeleton height="14px" width="140px" mb="6px" />
            <Skeleton height="40px" borderRadius="6px" />
          </Box>

          <Box mt="24px">
            <SkeletonText noOfLines={3} spacing="6px" />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default SettingsPageSkeleton;
