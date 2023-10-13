import map2D from "./map2D.ts";

export function sigma(num: number, callback: (j: number) => number): number {
  return Array.from({ length: num }, (_, i) => 1 + i).reduce(
    (pv, j) => pv + callback(j),
    0,
  );
}

export function average(arr: number[]): number {
  return arr.reduce((pv, cv) => pv + cv) / arr.length;
}

export function limit(n: number, max: number): number {
  return Math.max(0, Math.min(n, max));
}

export function distSq(_x: number, _y: number): number {
  return _x ** 2 + _y ** 2;
}

export function binarization(data: number[][], threshold: number): boolean[][] {
  return map2D(data, (v) => v >= threshold);
}

export function boolTo01(data: boolean[][]): number[][] {
  return map2D(data, (v) => (v ? 1 : 0));
}

export function max2D(data: number[][]): number {
  return (
    data
      .map((row) =>
        // y1行の最大
        row.reduce((pv, cv) => (cv >= pv ? cv : pv), Number.MIN_SAFE_INTEGER),
      )
      // 各行の最大の最大
      .reduce((pv, cv) => (cv >= pv ? cv : pv), Number.MIN_SAFE_INTEGER)
  );
}
export function min2D(data: number[][]): number {
  return (
    data
      .map((row) =>
        // y1行の最小
        row.reduce((pv, cv) => (cv <= pv ? cv : pv), Number.MAX_SAFE_INTEGER),
      )
      // 各行の最小の最小
      .reduce((pv, cv) => (cv <= pv ? cv : pv), Number.MAX_SAFE_INTEGER)
  );
}

export function flatten4DTo2D(arr: number[][][][]): number[][] {
  const { floor } = Math;

  const xMax = arr.length;
  const yMax = arr[0].length;
  const innerXMax = arr[0][0].length;
  const innerYMax = arr[0][0][0].length;

  return Array.from({ length: xMax * innerXMax }, (_, x) =>
    Array.from(
      { length: yMax * innerYMax },
      (_, y) =>
        arr[floor(x / innerYMax)][floor(y / innerYMax)][x % innerXMax][
          y % innerXMax
        ],
    ),
  );
}
