/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */

import sigma from "@/coordinateTransformation/sigma";

/**
 * 緯度経度を平面直角座標に変換
 *
 * @param lal `[long, lat]`
 * @param lal0 `[long0, lat0]`
 * @return `[y, x]`
 */
export default function lalToJpr(
  lal: [number, number],
  lal0: [number, number],
): [number, number] {
  const { sin, sinh, cosh, cos, atan, atanh, PI, sqrt } = Math;
  const [long, lat] = lal;
  const [long0, lat0] = lal0;

  const phi = (lat * PI) / 180;
  const lambda = (long * PI) / 180;
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
  const alpha = [
    NaN,
    (1 / 2) * n -
      (2 / 3) * n ** 2 +
      (5 / 16) * n ** 3 +
      (41 / 180) * n ** 4 -
      (127 / 288) * n ** 5,
    (13 / 48) * n ** 2 -
      (3 / 5) * n ** 3 +
      (557 / 1440) * n ** 4 +
      (281 / 630) * n ** 5,
    (61 / 240) * n ** 3 - (103 / 140) * n ** 4 + (15061 / 26880) * n ** 5,
    (49561 / 161280) * n ** 4 - (179 / 168) * n ** 5,
    (34729 / 80640) * n ** 5,
  ];

  const A_ = ((m0 * a) / (1 + n)) * A[0];
  const S_ =
    ((m0 * a) / (1 + n)) *
    (A[0] * phi0 + sigma(5, (j) => A[j] * sin(2 * j * phi0)));

  const lambdaC = cos(lambda - lambda0);
  const lambdaS = sin(lambda - lambda0);

  const t = sinh(
    atanh(sin(phi)) -
      ((2 * sqrt(n)) / (1 + n)) * atanh(((2 * sqrt(n)) / (1 + n)) * sin(phi)),
  );
  const t_ = sqrt(1 + t ** 2);

  const xi2 = atan(t / lambdaC);

  const eta2 = atanh(lambdaS / t_);

  const x =
    A_ *
      (xi2 +
        sigma(5, (j) => alpha[j] * sin(2 * j * xi2) * cosh(2 * j * eta2))) -
    S_;
  const y =
    A_ *
    (eta2 + sigma(5, (j) => alpha[j] * cos(2 * j * xi2) * sinh(2 * j * eta2)));

  return [y, x];
}
