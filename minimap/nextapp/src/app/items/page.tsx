import { Heading } from "@chakra-ui/react";
import Selector from "@/app/items/Selector";
import { readFile } from "fs/promises";
import { ItemList } from "@/@type/ItemList";

export default async function InfoEntry() {
  const itemList = (JSON.parse(
    await readFile("/data/item_list.json", "utf-8"),
  ) ?? []) as ItemList;

  return (
    <main>
      <Heading size="md" margin={50}>
        持ち物選択画面（仮）
      </Heading>
      <Selector itemList={itemList} />
    </main>
  );
}
