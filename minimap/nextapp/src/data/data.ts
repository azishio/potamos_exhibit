import { Vector2D } from "@/@type/Vector";
import { readStartPoint } from "@/data/readFiles";

export class GameState {
  name = "No Name";

  items: string[] = [];

  state: "playing" | "dead" | "goal" = "playing";

  startTime: number = 0;

  itemPoint: number = 0;

  private coordinate: Vector2D[];

  constructor(startPoint: Vector2D) {
    this.coordinate = [startPoint];
  }

  getLastCoordinate() {
    return this.coordinate.at(-1)!;
  }

  setStartTime() {
    this.startTime = new Date().getTime();
  }

  setCoordinate(coordinate: Vector2D) {
    this.coordinate.push(coordinate);
  }
}

const startPoints = (await readStartPoint()) as Vector2D[];
export const gameState: { content: GameState } = {
  content: new GameState(
    startPoints[Math.floor(Math.random() * startPoints.length)],
  ),
};
