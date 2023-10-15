import { type Vector2D } from "./Vector.ts";

export interface BuildingOutlineProperties {
  class: "Bldl";
}

export interface AltiProperties {
  class: "DEMPt";
  type: "地表面" | "表層面" | "海水面" | "内水面" | "データなし" | "その他";
  alti: number;
}

export type Properties = AltiProperties | BuildingOutlineProperties;

export interface DEMData {
  coordinate: Vector2D;
  alti: number;
  isWater: boolean;
}

export interface RdclProperties {
  class: "RdCL";
  rnkWidth:
    | "3m未満"
    | "3m-5.5m未満"
    | "5.5m-13m未満"
    | "13m-19.5m未満"
    | "19.5m以上";
}

export interface RdclData {
  coordinates: Vector2D[];
  coordinates: Vector2D;
  width: number;
}
