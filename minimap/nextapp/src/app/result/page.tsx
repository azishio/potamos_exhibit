import { Box, Center, Heading, Stack, Text } from "@chakra-ui/react";
import ToHomeButton from "@/app/result/ToHomeButton";
import { gameState } from "@/data/data";

export default function Page() {
  const { name, items } = gameState.state;

  return (
    <Box height="100vh" background="white">
      <Center padding={50}>
        <Stack>
          <Heading size="4xl" color="rgb(47,85,151)">
            SCORE
          </Heading>
          <Text fontSize="4xl">{name} さん</Text>
          <Text fontSize="4xl">- - - - - - - - - - - - - - - - - - - - -</Text>
          <Text fontSize="5xl" color="rgb(47,85,151)">
            持ち物：
          </Text>
          <Text fontSize="5xl" color="rgb(47,85,151)">
            避難経路：
          </Text>
          <Text fontSize="4xl">- - - - - - - - - - - - - - - - - - - - -</Text>
          <Text fontSize="5xl" color="rgb(47,85,151)">
            合計：
          </Text>
          <ToHomeButton />
        </Stack>
      </Center>
    </Box>
  );
}
