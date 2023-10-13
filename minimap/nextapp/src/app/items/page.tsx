import Selector from "@/app/items/Selector";
import { readItems } from "@/data/readFiles";

export default async function InfoEntry() {
  const items = await readItems();

  return (
    <main>
      <Selector items={items} />
    </main>
  );
}
