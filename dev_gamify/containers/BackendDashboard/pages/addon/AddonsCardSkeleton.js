import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";

const AddonCardsSkeleton = ({ count = 6 }) => {
  return (
    <div className="academy-dashboard-addon-cards">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          p="16px"
          border="1px solid var(--academy-border-color)"
          borderRadius="6px"
          bg="white"
        >
          {/* Header */}
          <Skeleton height="18px" width="60%" mb="8px" />
          <SkeletonText noOfLines={2} spacing="6px" />

          {/* Footer actions */}
          <Box mt="16px" display="flex" justifyContent="space-between">
            <Skeleton height="14px" width="80px" />
            <Skeleton height="28px" width="60px" borderRadius="4px" />
          </Box>
        </Box>
      ))}
    </div>
  );
};

export default AddonCardsSkeleton;