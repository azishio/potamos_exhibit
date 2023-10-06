import { type Vector2D } from "./Vector.ts";

export interface ContourProperties {
  alti: number;
  class: "Bldl";
}
export interface BuildingOutlineProperties {
  class: "Cntr";
}

export interface AltiProperties {
  class: "DEMPt";
  type: "地表面" | "表層面" | "海水面" | "内水面" | "データなし" | "その他";
  alti: number;
}

export type Properties = ContourProperties | BuildingOutlineProperties;

export interface DEMData {
  coordinate: Vector2D;
  alti: number;
  isWater: boolean;
}
