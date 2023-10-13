"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Items } from "@/@type/ImportTypes";

export default function Selector({ items }: { items: Items }) {
  const router = useRouter();
  const onStart = () => {
    router.push("/map");
  };

  return (
    <Box padding={50}>
      <Heading size="md" marginBottom={50} color="white">
        持ち物選択画面
      </Heading>
      <Flex gap={6} wrap="wrap">
        {items.map(({ name, point, description, image }) => (
          <Card style={{ width: 400 }}>
            <CardHeader>
              <Checkbox>
                <Heading size="md">{name}</Heading>
              </Checkbox>
            </CardHeader>
            <CardBody>
              <HStack>
                <Box>
                  {"★".repeat(point)}
                  <Divider />
                  <Text>{description}</Text>
                </Box>
                <Image
                  src={`/items/${image}`}
                  alt={name}
                  width={150}
                  height={200}
                />
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Flex>
      <Center>
        <Button onClick={onStart}>開始</Button>
      </Center>
    </Box>
  );
}
