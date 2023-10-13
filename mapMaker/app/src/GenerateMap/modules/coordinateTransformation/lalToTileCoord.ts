const ZOOM_LEVEL = 18;
const L = 85.05112878;

/**
 * 緯度経度をタイル座標に変換する。
 *
 * @param lal `[long, lat]`
 * @return `[x, y]`;
 */
export default function lalToTileCoord(
  lal: [number, number],
): [number, number] {
  const { floor, PI, atanh, sin } = Math;
  const [long, lat] = lal;

  const pixelX = 2 ** (ZOOM_LEVEL + 7) * (long / 180 + 1);
  const pixelY =
    (2 ** (ZOOM_LEVEL + 7) / PI) *
    (-atanh(sin((PI / 180) * lat)) + atanh(sin((PI / 180) * L)));

  const tileX = floor(pixelX / 256);
  const tileY = floor(pixelY / 256);

  return [tileX, tileY];
}
