"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ToHomeButton() {
  const router = useRouter();

  return (
    <Button marginTop={100} onClick={() => router.push("/")}>
      最初へ戻る
    </Button>
  );
}
