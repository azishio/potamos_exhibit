import { type Rect, type Vector2D } from "./Vector.ts";

export interface MapInfo {
  pointsAABB: Rect;
  mapAABB: Rect;
  paddingAABB: Rect;
  tileList18: Vector2D[];
  tileList16: Vector2D[];
  imageNum: [number, number, number, number];
}
export interface SlicedMap {
  lt: Vector2D;
  data: number[][];
}
