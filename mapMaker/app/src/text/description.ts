import CliTable3 from "cli-table3";

/* eslint-disable no-irregular-whitespace */

const description = `
　このツールは、指定された範囲の情報を国土地理院から取得し、
Heightマップや建物の簡易モデルを作成するものです。

　以下の例に従って、[project dir] > input > points.json に座標を書き込んでください。
${(() => {
  const table = new CliTable3({
    head: ["points.json"],
  });
  table.push([
    JSON.stringify(
      {
        systemCode: 9,
        coordinates: [
          [139.456329345703, 36.313916056183],
          [139.456352111, 36.31391225],
          [139.456409611, 36.3139025],
        ],
      },
      null,
      2,
    ),
  ]);
  return table.toString();
})()}
このとき、各項目は以下の意味を持ちます。
${(() => {
  const table = new CliTable3({
    head: ["項目", "説明"],
  });
  table.push(
    [
      "systemCode",
      "`coordinates`に指定する範囲に適用される平面直角座標系の計番号です。",
    ],
    [
      "coordinates",
      `指定したい範囲に含まれる頂点群。経度、緯度の順で配列に格納します。
ここに含まれる頂点は平面直角座標系の系が同じであることが推奨されます。
`,
    ],
  );
  return table.toString();
})()}

^ 使い方 ^
`;

export default description;
