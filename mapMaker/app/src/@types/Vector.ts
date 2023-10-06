export type Vector2D = [number, number];

export type Vector3D = [number, number, number];

export type Vector3Df32List = Float32Array[][];

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Bounds {
  lt: [number, number];
  rb: [number, number];
  rect: Rect;
}

export type SystemCode =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19;
