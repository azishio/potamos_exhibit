/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */

import { sigma } from "../utils/math.ts";

/**
 * 平面直角座標を緯度経度に変換
 *
 * @param jpr `[y, x]`
 * @param lal0 `[long0, lat0]`
 * @return `[long, lat]`
 */
export default function jprToLal(
  jpr: [number, number],
  lal0: [number, number],
): [number, number] {
  const { sin, sinh, asin, cosh, cos, atan, PI } = Math;
  const [y, x] = jpr;
  const [long0, lat0] = lal0;
  const phi0 = (lat0 * PI) / 180;
  const lambda0 = (long0 * PI) / 180;

  const a = 6_378_137;
  const F = 298.257222101;
  const m0 = 0.9999;
  const n = 1 / (2 * F - 1);

  const A = [
    1 + n ** 2 / 4 + n ** 4 / 64,
    -(3 / 2) * (n - n ** 3 / 8 - n ** 5 / 64),
    (15 / 16) * (n ** 2 - n ** 4 / 4),
    -(35 / 48) * (n ** 3 - (5 / 16) * n ** 5),
    (315 / 512) * n ** 4,
    -(693 / 1280) * n ** 5,
  ];

  const Beta = [
    NaN,
    (1 / 2) * n -
      (2 / 3) * n ** 2 +
      (37 / 96) * n ** 3 -
      (1 / 360) * n ** 4 -
      (81 / 512) * n ** 5,
    (1 / 48) * n ** 2 +
      (1 / 15) * n ** 3 -
      (437 / 1440) * n ** 4 +
      (46 / 105) * n ** 5,
    (17 / 480) * n ** 3 - (37 / 840) * n ** 4 - (209 / 4480) * n ** 5,
    (4397 / 161280) * n ** 4 - (11 / 504) * n ** 5,
    (4583 / 161280) * n ** 5,
  ];

  const Delta = [
    NaN,
    2 * n -
      (2 / 3) * n ** 2 -
      2 * n ** 3 +
      (116 / 45) * n ** 4 +
      (26 / 45) * n ** 5 -
      (2854 / 675) * n ** 6,
    (7 / 3) * n ** 2 -
      (8 / 5) * n ** 3 -
      (227 / 45) * n ** 4 +
      (2704 / 315) * n ** 5 +
      (2323 / 945) * n ** 6,
    (56 / 15) * n ** 3 -
      (136 / 35) * n ** 4 -
      (1262 / 105) * n ** 5 +
      (73814 / 2835) * n ** 6,
    (4279 / 630) * n ** 4 - (332 / 35) * n ** 5 - (399572 / 14175) * n ** 6,
    (4174 / 315) * n ** 5 - (144838 / 6237) * n ** 6,
    (601676 / 22275) * n ** 6,
  ];

  const S_ =
    ((m0 * a) / (1 + n)) *
    (A[0] * phi0 + sigma(5, (j) => A[j] * sin(2 * j * phi0)));

  const A_ = ((m0 * a) / (1 + n)) * A[0];

  const xi = (x + S_) / A_;

  const eta = y / A_;

  const xi2 =
    xi - sigma(5, (j) => Beta[j] * sin(2 * j * xi) * cosh(2 * j * eta));

  const eta2 =
    eta - sigma(5, (j) => Beta[j] * cos(2 * j * xi) * sinh(2 * j * eta));

  const chi = asin(sin(xi2) / cosh(eta2));

  const lat = chi + sigma(6, (j) => Delta[j] * sin(2 * j * chi));

  const long = lambda0 + atan(sinh(eta2) / cos(xi2));

  const longDeg = (long * 180) / PI;
  const latDeg = (lat * 180) / PI;

  return [longDeg, latDeg];
}
