import { readShelter } from "@/data/readFiles";
import { gameState } from "@/data/data";

export default async function beGoal() {
  const shelters = await readShelter();
  const [long, lat] = gameState.content.getLastCoordinate();
  return shelters.some(
    ({ coordinate: [long0, lat0] }) =>
      (long - long0) ** 2 + (lat - lat0) ** 2 < 0.00000001,
  );
}
