import { gameState } from "@/data/data";
import inArea from "@/app/last-location/judgment/inArea";
import { Vector2D } from "@/@type/Vector";
import { readDangerZone } from "@/data/readFiles";

export default async function beDead() {
  const elapsedTime = new Date().getTime() - gameState.content.startTime;
  const lastLocation = gameState.content.getLastCoordinate();

  const currentDZ = (await readDangerZone())
    .filter(({ time }) => time * 1000 < elapsedTime)
    .map((v) => v.areas);

  return currentDZ.some((dangerzones) =>
    dangerzones.map((dangerzone) =>
      inArea(lastLocation, dangerzone as Vector2D[]),
    ),
  );
}
