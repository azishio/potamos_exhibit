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
import { ItemList } from "@/@type/ItemList";
import { useRouter } from "next/navigation";

export default function Selector({ itemList }: { itemList: ItemList }) {
  const router = useRouter();
  const onStart = () => {
    router.push("/map");
  };

  return (
    <Box>
      <Flex gap={6} wrap="wrap" margin={50}>
        {itemList.map(({ name, point, description, image }) => (
          <Card style={{ width: 300, height: 200 }}>
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
                  src={`/bringList/${image}`}
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
