"use client";

import {
  Button,
  Card,
  CardBody,
  Center,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Content() {
  const router = useRouter();
  const onStart = async () => {
    router.push("/items");
  };
  return (
    <Center h="100vh">
      <VStack>
        <Card w="50vw">
          <CardBody>
            <Heading size="xs">ニックネーム</Heading>
            <Input placeholder="ニックネーム" />
          </CardBody>
        </Card>
        <Button onClick={onStart}>持ち物選択</Button>
      </VStack>
    </Center>
  );
}
