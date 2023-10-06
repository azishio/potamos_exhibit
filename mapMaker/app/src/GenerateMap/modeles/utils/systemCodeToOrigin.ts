import { type SystemCode } from "../../../@types/Vector.ts";

/**
 * 系番号から、平面直角座標系の原点を取得する
 * @param systemCode 系番号
 * @return `[long0, lat0]`
 */
export default function systemCodeToOrigin(
  systemCode: SystemCode,
): [number, number] {
  let long0 = 0;
  let lat0 = 0;

  switch (systemCode) {
    case 1:
      long0 = 129.5;
      lat0 = 33;
      break;
    case 2:
      long0 = 131;
      lat0 = 33;
      break;
    case 3:
      long0 = 132 + 1 / 6;
      lat0 = 36;
      break;
    case 4:
      long0 = 133.5;
      lat0 = 33;
      break;
    case 5:
      long0 = 134 + 1 / 3;
      lat0 = 36;
      break;
    case 6:
      long0 = 136;
      lat0 = 36;
      break;
    case 7:
      long0 = 137 + 1 / 6;
      lat0 = 36;
      break;
    case 8:
      long0 = 138.5;
      lat0 = 36;
      break;
    case 9:
      long0 = 139 + 5 / 6;
      lat0 = 36;
      break;
    case 10:
      long0 = 140 + 5 / 6;
      lat0 = 40;
      break;
    case 11:
      long0 = 140.25;
      lat0 = 44;
      break;
    case 12:
      long0 = 142.25;
      lat0 = 44;
      break;
    case 13:
      long0 = 144.25;
      lat0 = 44;
      break;
    case 14:
      long0 = 142;
      lat0 = 26;
      break;
    case 15:
      long0 = 127.5;
      lat0 = 26;
      break;
    case 16:
      long0 = 124;
      lat0 = 26;
      break;
    case 17:
      long0 = 131;
      lat0 = 26;
      break;
    case 18:
      long0 = 136;
      lat0 = 20;
      break;
    case 19:
      long0 = 154;
      lat0 = 26;
      break;
    default:
  }

  return [long0, lat0];
}
