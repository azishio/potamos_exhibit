import { Vector2D } from "@/@type/Vector";

const diff = (v1: Vector2D, v2: Vector2D) => [v1[0] - v2[0], v1[1] - v2[0]];
export default function inArea(point: Vector2D, area: Vector2D[]): boolean {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const sumAngle = area.reduce((sumAngle, cp, index, area): number => {
    if (index === 0) return sumAngle;

    const [a1, a2] = diff(area[index - 1], point);
    const [b1, b2] = diff(cp, point);

    const dot = a1 * b1 + a2 * b2;
    const cross = a1 * b2 - a2 * b1;

    const angle = Math.atan2(cross, dot);
    return sumAngle + angle;
  }, 0);

  return Math.abs(sumAngle) < 0.01;
}
