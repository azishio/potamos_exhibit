import { type AkimaFactorArg } from "../../../@types/Akima.ts";
import { NULL } from "../../constants.ts";
import { flatten4DTo2D } from "../utils/math.ts";
import type Progress from "../../../ui/progress.ts"; // 独立変数:independent_variable / 応答変数:response_variable

// 独立変数:independent_variable / 応答変数:response_variable

/**
 * 計算に必要な欠損した値を予測して代替する
 * 両端が欠損していることは内容にすること
 * @param arg
 */
function completeNeedArg(arg: AkimaFactorArg): AkimaFactorArg {
  const { i0, i1, i2, i3, i4, i5, r0, r1, r2, r3, r4, r5 } = arg;

  if (
    [r0, r1].some((v) => v === NULL) &&
    [r4, r3, r2].every((v) => v !== NULL)
  ) {
    const m4 = (r4 - r3) / (i4 - i3);
    const m3 = (r3 - r2) / (i3 - i2);

    const I0 = -i4 + 2 * i2;
    const I1 = i2 + i3 - i4;

    const R1 = r2 - (i2 - I1) * (-m4 + 2 * m3);
    const R0 = R1 - (I1 - I0) * (-m4 + 3 * m3);

    return {
      ...arg,
      i0: i0 !== NULL ? i0 : I0,
      i1: i1 !== NULL ? i1 : I1,
      r0: r0 !== NULL ? r0 : R0,
      r1: r1 !== NULL ? r1 : R1,
    };
  }

  if (
    [r4, r5].some((v) => v === NULL) &&
    [r1, r2, r3].every((v) => v !== NULL)
  ) {
    const m1 = (r2 - r1) / (i2 - i1);
    const m2 = (r3 - r2) / (i3 - i2);

    const I4 = -i1 + i2 + i3;
    const I5 = -i1 + 2 * i3;

    const R4 = r3 + (I4 - i3) * (2 * m2 - m1);
    const R5 = R4 + (I5 - I4) * (3 * m2 - 2 * m1);

    return {
      ...arg,
      i4: i4 !== NULL ? i4 : I4,
      i5: i5 !== NULL ? i5 : I5,
      r4: r4 !== NULL ? r4 : R4,
      r5: r5 !== NULL ? r5 : R5,
    };
  }

  return arg;
}

function akimaFactor(arg: AkimaFactorArg): {
  a0: number;
  a1: number;
  a2: number;
  a3: number;
} {
  const { abs } = Math;
  const completedArg = completeNeedArg(arg);

  if (Object.values(completedArg).some((v) => v === NULL))
    return {
      a0: NULL,
      a1: NULL,
      a2: NULL,
      a3: NULL,
    };

  const { i0, i1, i2, i3, i4, i5, r0, r1, r2, r3, r4, r5 } = completedArg;

  const m0 = (r1 - r0) / (i1 - i0);
  const m1 = (r2 - r1) / (i2 - i1);
  const m2 = (r3 - r2) / (i3 - i2);
  const m3 = (r4 - r3) / (i4 - i3);
  const m4 = (r5 - r4) / (i5 - i4);

  const w1 =
    (abs(m1 - m0) + abs(m1 + m0) / 2) / (abs(m3 - m2) + abs(m3 + m2) / 2);

  const w2 = (m2 - m1 + abs(m2 + m1) / 2) / (m4 - m3 + abs(m4 + m3) / 2);

  const q1 = (m1 - m2) / (1 + w1);
  const q2 = (m3 - m2) / (1 + w2);

  const a0 = r2;
  const a1 = q1 + m2;
  const a2 = -(2 * q1 + q2) / (i3 - i2);
  const a3 = (q1 + q2) / (i3 - i2) ** 2;
  return { a0, a1, a2, a3 };
}

function akima(arg: {
  i: number;
  a0: number;
  a1: number;
  a2: number;
  a3: number;
  i2: number;
}): number {
  if (Object.values(arg).some((v) => v === NULL)) return NULL;

  const { i, a0, a1, a2, a3, i2 } = arg;
  return a0 + a1 * (i - i2) + a2 * (i - i2) ** 2 + a3 * (i - i2) ** 3;
}

export function akimaMissingInterpolation(
  data: number[][],
  overshootSuppression: number,
  nullAs = NULL,
  progress?: Progress,
): number[][] {
  const { max, min } = Math;

  const xMax = data.length;
  const yMax = data[0].length;

  progress?.init(xMax * yMax);

  const result = Array.from({ length: xMax }, (_, x) =>
    Array.from({ length: yMax }, (__, y) => {
      progress?.increment();

      if (data[x][y] !== NULL) return data[x][y];

      // 参照している点
      const points: number[] = [];
      const factorX = [-3, -2, -1, 1, 2, 3].map((dy) => {
        let x0 = NULL;
        let x1 = NULL;
        let x2 = NULL;
        let x3 = NULL;
        let x4 = NULL;
        let x5 = NULL;

        // 値が有効な点を探す
        for (let xx = x - 1; xx >= 0; xx--) {
          const value = data[xx][y] === NULL ? nullAs : data[xx][y];
          if (value === NULL) continue;

          if (x2 === NULL) x2 = xx;
          else if (x1 === NULL) x1 = xx;
          else if (x0 === NULL) {
            x0 = xx;
            break;
          }
        }
        for (let xx = x + 1; xx < xMax; xx++) {
          const value = data[xx][y];
          if (value === NULL) continue;

          if (x3 === NULL) x3 = xx;
          else if (x4 === NULL) x4 = xx;
          else if (x5 === NULL) {
            x5 = xx;
            break;
          }
        }

        const y0x0 = data.at(x0)?.at(y + dy) ?? NULL;
        const y0x1 = data.at(x1)?.at(y + dy) ?? NULL;
        const y0x2 = data.at(x2)?.at(y + dy) ?? NULL;
        const y0x3 = data.at(x3)?.at(y + dy) ?? NULL;
        const y0x4 = data.at(x4)?.at(y + dy) ?? NULL;
        const y0x5 = data.at(x5)?.at(y + dy) ?? NULL;

        points.push(
          ...[y0x0, y0x1, y0x2, y0x3, y0x4, y0x5].filter((v) => v !== NULL),
        );

        return akimaFactor({
          i0: x0,
          i1: x1,
          i2: x2,
          i3: x3,
          i4: x4,
          i5: x5,
          r0: y0x0,
          r1: y0x1,
          r2: y0x2,
          r3: y0x3,
          r4: y0x4,
          r5: y0x5,
        });
      });

      // 参照する点がなければNULL
      if (points.length === 0) return NULL;

      const maxValue = points.length === 0 ? NULL : max(...points);
      const minValue = points.length === 0 ? NULL : min(...points);
      const delta = maxValue - minValue;

      const factorY = akimaFactor({
        i0: 0,
        i1: 1,
        i2: 2,
        i3: 3,
        i4: 4,
        i5: 5,
        r0: akima({ ...factorX[0], i2: x - 1, i: x }),
        r1: akima({ ...factorX[1], i2: x - 1, i: x }),
        r2: akima({ ...factorX[2], i2: x - 1, i: x }),
        r3: akima({ ...factorX[3], i2: x - 1, i: x }),
        r4: akima({ ...factorX[4], i2: x - 1, i: x }),
        r5: akima({ ...factorX[5], i2: x - 1, i: x }),
      });

      const result = akima({ ...factorY, i2: y - 1, i: y });
      if (
        result < minValue - delta * overshootSuppression ||
        result > maxValue + delta * overshootSuppression
      )
        return (maxValue + minValue) / 2;

      return result;
    }),
  );

  progress?.clear();

  return result;
}
export function akimaUpSampling(
  scale: number,
  data: number[][],
  overshootSuppression: number,
  progress?: Progress,
): number[][] {
  const { abs, floor, max, min } = Math;

  const xMax = data.length;
  const yMax = data[0].length;

  progress?.init(xMax * yMax);

  const validScale = abs(floor(scale));
  const upSampledData = Array.from({ length: xMax }, (_, x) =>
    Array.from({ length: yMax }, (__, y) => {
      progress?.increment();

      const points: number[] = [];

      const factorX = [-2, -1, 0, 1, 2, 3].map((dy) => {
        const y0x0 = data.at(x - 2)?.at(y + dy) ?? NULL;
        const y0x1 = data.at(x - 1)?.at(y + dy) ?? NULL;
        const y0x2 = data.at(x + 0)?.at(y + dy) ?? NULL;
        const y0x3 = data.at(x + 1)?.at(y + dy) ?? NULL;
        const y0x4 = data.at(x + 2)?.at(y + dy) ?? NULL;
        const y0x5 = data.at(x + 3)?.at(y + dy) ?? NULL;

        points.push(
          ...[y0x0, y0x1, y0x2, y0x3, y0x4, y0x5].filter((v) => v !== NULL),
        );

        return akimaFactor({
          i0: x - 2,
          i1: x - 1,
          i2: x + 0,
          i3: x + 1,
          i4: x + 2,
          i5: x + 3,
          r0: y0x0,
          r1: y0x1,
          r2: y0x2,
          r3: y0x3,
          r4: y0x4,
          r5: y0x5,
        });
      });

      const maxValue = points.length === 0 ? NULL : max(...points);
      const minValue = points.length === 0 ? NULL : min(...points);
      const delta = maxValue - minValue;

      return Array.from({ length: validScale }, (___, dx) =>
        Array.from({ length: validScale }, (____, dy) => {
          // 参照する点がなければNULL
          if (points.length === 0) return NULL;

          const X = x + dx / (validScale - 1);
          const Y = y + dy / (validScale - 1);
          const factorY = akimaFactor({
            i0: 0,
            i1: 1,
            i2: 2,
            i3: 3,
            i4: 4,
            i5: 5,
            r0: akima({ ...factorX[0], i2: x, i: X }),
            r1: akima({ ...factorX[1], i2: x, i: X }),
            r2: akima({ ...factorX[2], i2: x, i: X }),
            r3: akima({ ...factorX[3], i2: x, i: X }),
            r4: akima({ ...factorX[4], i2: x, i: X }),
            r5: akima({ ...factorX[5], i2: x, i: X }),
          });

          const result = akima({ ...factorY, i2: y, i: Y });
          if (
            result < minValue - delta * overshootSuppression ||
            result > maxValue + delta * overshootSuppression
          )
            return (maxValue + minValue) / 2;

          return result;
        }),
      );
    }),
  );

  const result = flatten4DTo2D(upSampledData);

  progress?.clear();

  return result;
}
