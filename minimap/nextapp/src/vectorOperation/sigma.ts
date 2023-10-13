export default function sigma(
  num: number,
  callback: (j: number) => number,
): number {
  return Array.from({ length: num }, (_, i) => 1 + i).reduce(
    (pv, j) => pv + callback(j),
    0,
  );
}
