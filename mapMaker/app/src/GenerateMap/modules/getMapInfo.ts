import { type MapInfo } from "../../@types/Map.ts";
import lalToJpr from "./coordinateTransformation/lalToJpr.ts";
import systemCodeToOrigin from "./utils/systemCodeToOrigin.ts";
import jprToLal from "./coordinateTransformation/jprToLal.ts";
import {
  type Bounds,
  type Rect,
  type SystemCode,
  type Vector2D,
} from "../../@types/Vector.ts";
import lalToTileCoord from "./coordinateTransformation/lalToTileCoord.ts";

/**
 * 経緯度のポイント郡と、それらが属する平面直角座標系の系番号から、正方形のマップを生成するのに必要な情報を生成する。
 * @param points 緯度経度で表現されたポイントの配列
 * @param systemCode 系番号
 */

export default function getMapInfo(
  points: Vector2D[],
  systemCode: SystemCode,
): MapInfo {
  const { max, min, floor, ceil } = Math;

  const longitudeList = points.map(([long]) => long);
  const latitudeList = points.map(([, lat]) => lat);

  const lal0 = systemCodeToOrigin(systemCode);
  /* AABB */
  const pointsAABB: Bounds = (() => {
    const [left, top] = lalToJpr(
      [min(...longitudeList), max(...latitudeList)],
      lal0,
    );
    const [right, bottom] = lalToJpr(
      [max(...longitudeList), min(...latitudeList)],
      lal0,
    );

    return {
      lt: [left, top],
      rb: [right, bottom],
      rect: { right, left, bottom, top },
    };
  })();

  // タイルの大きさは8001/4001/2001/1001の4種類
  const tileNums: [number, number, number, number] = (() => {
    const { top, bottom, right, left } = pointsAABB.rect;
    const longBoundary = max(top - bottom, right - left);

    return [
      floor(longBoundary / 8001),
      floor((longBoundary % 8001) / 4001),
      floor(((longBoundary % 8001) % 4001) / 2001),
      ((num) => (num > 0 ? num : 1))(
        ceil((((longBoundary % 8001) % 4001) % 2001) / 1001),
      ),
    ];
  })();

  /* pointsAABBを内包する正方形領域 */
  const mapAABB: Rect = (() => {
    const mapSize =
      8001 * tileNums[0] +
      4001 * tileNums[1] +
      2001 * tileNums[2] +
      1001 * tileNums[3] -
      // 各辺は頂点を共有する
      tileNums.reduce((pv, cv) => pv + cv) +
      1;

    const centerX = (pointsAABB.rect.top + pointsAABB.rect.bottom) / 2;
    const centerY = (pointsAABB.rect.left + pointsAABB.rect.right) / 2;
    const top = centerX + mapSize / 2;
    const bottom = centerX - mapSize / 2;
    const left = centerY - mapSize / 2;
    const right = centerY + mapSize / 2;

    return {
      top,
      bottom,
      left,
      right,
    };
  })();

  const mapPadding: Bounds = (() => {
    const { top: t, bottom: b, left: l, right: r } = mapAABB;

    const top = t + 100;
    const bottom = b - 100;
    const left = l - 100;
    const right = r + 100;
    return {
      lt: [left, top],
      rb: [right, bottom],
      rect: { top, right, bottom, left },
    };
  })();

  /* 正方形の頂点を緯度経度に */
  const mapLalPadding: Bounds = (() => {
    const [left, top] = jprToLal(mapPadding.lt, lal0);
    const [right, bottom] = jprToLal(mapPadding.rb, lal0);

    return {
      lt: [left, top],
      rb: [right, bottom],
      rect: { top, left, right, bottom },
    };
  })();

  /* 正方形の頂点を含むタイルの座標 */
  const needTilesAABB: Rect = (() => {
    const [left, top] = lalToTileCoord(mapLalPadding.lt);
    const [right, bottom] = lalToTileCoord(mapLalPadding.rb);

    return { left, top, right, bottom };
  })();

  const tileList = (() => {
    const { left, top, right, bottom } = needTilesAABB;

    const tiles: Vector2D[] = [];
    for (let x = left; x <= right; x++)
      for (let y = top; y <= bottom; y++) tiles.push([x, y]);

    return tiles;
  })();

  return {
    pointsAABB: pointsAABB.rect,
    mapAABB,
    paddingAABB: mapPadding.rect,
    tile: {
      rect: needTilesAABB,
      list: tileList,
      nums: tileNums,
    },
  };
}
