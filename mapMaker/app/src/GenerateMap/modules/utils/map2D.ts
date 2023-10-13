export default function map2D<T, U>(
  arr: T[][],
  callback: (v: T, x: number, y: number) => U,
): U[][] {
  return arr.map((a, x) => a.map((v, y) => callback(v, x, y)));
}
