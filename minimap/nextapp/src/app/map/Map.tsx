"use client";

import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import { icon, LatLng } from "leaflet";
import { DangerZones, Shelters } from "@/@type/ImportTypes";
import { useEffect, useState } from "react";
import { Vector2D } from "@/@type/Vector";
import { useRouter } from "next/navigation";

export default function Map({
  dangerZones,
  shelters,
  firstPosition,
  startTime,
}: {
  dangerZones: DangerZones;
  shelters: Shelters;
  firstPosition: Vector2D;
  startTime: number;
}) {
  const router = useRouter();

  const [position, setPosition] = useState<Vector2D>(firstPosition);
  const [currentDangerZone, setCurrentDangerZone] = useState<Vector2D[][][]>(
    [],
  );
  const [preDangerZone, setPreDangerZone] = useState<Vector2D[][]>([]);
  const [showPreDangerZone, setShowPreDangerZone] = useState(true);

  const fetchPosition = async () => {
    const [long, lat] = (await (
      await fetch("/last-location", { method: "GET" })
    ).json()) as Vector2D;

    setPosition([lat, long]);
    setShowPreDangerZone((pre) => !pre);

    const elapsedTime = new Date().getTime() - startTime;

    const currentDZ = dangerZones
      .filter(({ time }) => time * 1000 < elapsedTime)
      .map((v) => v.areas);
    const preDZ = dangerZones.find(
      ({ time }) =>
        time * 1000 < elapsedTime + 5000 && time * 1000 - elapsedTime > 0,
    )?.areas;

    setCurrentDangerZone((currentDZ as Vector2D[][][]) ?? []);
    setPreDangerZone((preDZ ?? []) as Vector2D[][]);

    const state = await (await fetch("/state", { method: "GET" })).json();
    if (state.state !== "playing") router.push("/result");
  };

  useEffect(() => {
    const timer = setTimeout(fetchPosition, 1000);
    return () => clearTimeout(timer);
  }, [position]);

  return (
    <MapContainer
      zoom={17}
      style={{
        width: "100vw",
        height: "100vh",
      }}
      center={position}
    >
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      />

      <Marker
        position={position}
        icon={icon({ iconUrl: "/marker.svg", iconSize: [100, 100] })}
      />
      {shelters.map(({ coordinate: [long, lat], name }) => (
        <Marker
          position={new LatLng(lat, long)}
          icon={icon({ iconUrl: "/safetyMaker.svg", iconSize: [50, 50] })}
          key={name}
        >
          <Popup>{name}</Popup>
        </Marker>
      ))}
      <Polygon
        pathOptions={{
          color: "blue",
          opacity: 0,
        }}
        positions={currentDangerZone}
      />
      <Polygon
        pathOptions={{
          color: "blue",
          opacity: 0,
          fillOpacity: showPreDangerZone ? 0.2 : 0,
        }}
        positions={preDangerZone}
      />
    </MapContainer>
  );
}
