import { Box, Flex, Skeleton, SkeletonText } from "@chakra-ui/react";
import GamifyBox from "@GFComponents/GamifyBox";
import RequirementsLoader from "./RequirementsLoader";
import GamifyInput from "@GFComponents/GamifyInput";

const AchievementFormLoader = () => {
  return (
    <>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        bg="var(--gamify-background)"
        boxShadow={'var(--gamify-shadow)'}
        width="100%"
        top="32px"
        mb="24px"
        p="20px 24px"
      >
        <Flex align="center" gap={2} width="50%">
          <Skeleton height="36px" width="36px" />
          <Box width="4px" height="6px" bg="var(--gamify-primary)" />
          <Skeleton height="40px" width="40%" borderRadius="6px" />
        </Flex>

        <Skeleton height="40px" width="20%" borderRadius="6px" />
      </Flex>

      <GamifyBox heading={<Skeleton height="20px" width="50%" />}>
        <Flex direction="column" gap={6}>
          <GamifyInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="40px" width="100%" />
          </GamifyInput>

          <GamifyInput label={<Skeleton height="20px" width="20%" />} desc={<Skeleton height="20px" width="80%" />}>
            <Skeleton height="40px" width="100%" />
          </GamifyInput>

          <GamifyInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="40px" width="20%" borderRadius="6px" />
          </GamifyInput>

          <GamifyInput label={<Skeleton height="20px" width="20%" />}>
            <Skeleton height="200px" width="100%" />
          </GamifyInput>

          <GamifyInput label={<Flex alignItems="center" gap={2}><Skeleton height="20px" width="20%" /> <Skeleton height="20px" width="5%" /></Flex>}>
          </GamifyInput>

          <Box
            padding="24px"
            border="1px solid var(--gamify-border-color)"
            borderRadius="4px"
            width="100%"
          >
            <Skeleton height="32px" width="20%" mb={6} />

            <Flex gap="24px">
              <Flex width="50%" p="24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px">
                <Skeleton height="20px" width="20%" />
                <Skeleton height="14px" width="80%" />

                <Skeleton height="72px" borderRadius="4px" />

                <Flex direction="column" gap="8px">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} height="56px" borderRadius="6px" />
                  ))}
                </Flex>
              </Flex>

              <Flex width="50%" p="24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px">
                <Skeleton height="20px" width="20%" />
                <Skeleton height="14px" width="80%" />

                {[1, 2].map(i => (
                  <Skeleton key={i} height="96px" borderRadius="6px" />
                ))}
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </GamifyBox>
    </>
  );
};

export default AchievementFormLoader;
