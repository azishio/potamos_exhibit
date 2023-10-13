import { Vector2D } from "@/@type/Vector";
import { readStartPoint } from "@/data/readFiles";

export class GameState {
  name = "No Name";

  items: string[] = [];

  private coordinate: Vector2D[];

  private dead = false;

  private startTime: number;

  private continue = true;

  constructor(startPoint: Vector2D) {
    this.coordinate = [startPoint];
    this.startTime = new Date().getTime();
  }

  getLastCoordinate() {
    return this.coordinate.at(-1)!;
  }

  setCoordinate(coordinate: Vector2D) {
    this.coordinate.push(coordinate);
  }
}

const startPoints = (await readStartPoint()) as Vector2D[];
export const gameState: { state: GameState } = {
  state: new GameState(
    startPoints[Math.floor(Math.random() * startPoints.length)],
  ),
};
