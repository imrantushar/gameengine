import { Box, Flex, Skeleton, SkeletonText } from "@chakra-ui/react";
import GamifyBox from "@GFComponents/GamifyBox";

const HookListSkeleton = ({ items = 4 }) => (
  <Flex direction="column" gap="12px">
    {Array.from({ length: items }).map((_, i) => (
      <Skeleton key={i} height="56px" borderRadius="4px" />
    ))}
  </Flex>
);

const HookSidebarSkeleton = ({ items = 2 }) => (
  <Flex direction="column" gap="16px">
    {Array.from({ length: items }).map((_, i) => (
      <Skeleton key={i} height="110px" borderRadius="6px" />
    ))}
  </Flex>
);

const LevelsFormSkeleton = () => {
  return (
    <>
      <Flex justify="space-between" align="center" mb={6} padding={'20px'}>
        <Skeleton height="32px" width="260px" />
        <Skeleton height="40px" width="140px" borderRadius="6px" />
      </Flex>
      <GamifyBox dynamicClasses="gamify-achievements" >
        <Flex direction="column" gap={6}>
          {/* Title + Plural */}
          <Flex gap="12px">
            <Skeleton height="56px" width="50%" />
            <Skeleton height="56px" width="50%" />
          </Flex>

          {/* Max earnings */}
          <Skeleton height="56px" />

          {/* Achievement Type */}
          <Box>
            <Skeleton height="20px" width="200px" mb="12px" />
            <Skeleton height="64px" borderRadius="4px" />
            <Skeleton height="32px" width="160px" mt="12px" />
          </Box>

          {/* Congratulations Editor */}
          <Box>
            <Skeleton height="20px" width="240px" mb="12px" />
            <Skeleton height="140px" borderRadius="6px" />
          </Box>

          {/* Unlock with points */}
          <Skeleton height="32px" width="260px" />

          {/* Requirements Section */}
          <Box p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
            <Skeleton height="24px" width="260px" mb="16px" />

            <Flex gap="24px">
              {/* Available hooks */}
              <Flex width="50%" direction="column" gap="16px">
                <Skeleton height="20px" width="180px" />
                <SkeletonText noOfLines={2} spacing="2" />
                <Skeleton height="72px" borderRadius="4px" />
                <HookListSkeleton />
              </Flex>

              {/* Active hooks */}
              <Flex width="50%" direction="column" gap="16px">
                <Skeleton height="20px" width="160px" />
                <SkeletonText noOfLines={2} spacing="2" />
                <HookSidebarSkeleton />
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </GamifyBox>
    </>
  );
};

export default LevelsFormSkeleton;
