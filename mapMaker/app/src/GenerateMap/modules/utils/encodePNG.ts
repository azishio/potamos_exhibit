import { encode } from "fast-png";

export default function encodePNG(map: number[][]): Uint8Array {
  const data = new Uint16Array(map.flat());

  return encode({
    height: map.length,
    width: map[0].length,
    data,
    channels: 1,
    depth: 16,
  });
}
