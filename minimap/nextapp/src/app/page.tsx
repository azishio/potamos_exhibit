import Content from "@/app/content";
import { readStartPoint } from "@/data/readFiles";
import { GameState, gameState } from "@/data/data";
import { Vector2D } from "@/@type/Vector";

export default async function InfoEntry() {
  const initCoordinates = await readStartPoint();
  const initCoordinate: Vector2D = initCoordinates[
    Math.floor(Math.random() * initCoordinates.length)
  ] as Vector2D;

  gameState.content = new GameState(initCoordinate);

  return (
    <main>
      <Content />
    </main>
  );
}
