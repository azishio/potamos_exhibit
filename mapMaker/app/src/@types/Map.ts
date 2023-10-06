import { type Rect, type Vector2D } from "./Vector.ts";

export interface MapInfo {
  pointsAABB: Rect;
  mapAABB: Rect;
  paddingAABB: Rect;
  tile: {
    rect: Rect;
    list: Vector2D[];
    nums: [number, number, number, number];
  };
}
export interface SlicedMap {
  lt: Vector2D;
  data: number[][];
}
