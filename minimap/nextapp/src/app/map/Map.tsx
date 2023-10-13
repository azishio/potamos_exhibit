"use client";

import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import { icon, LatLng } from "leaflet";
import { DangerZones, Shelters } from "@/@type/ImportTypes";
import { useEffect, useRef, useState } from "react";
import { Vector2D } from "@/@type/Vector";

export default function Map({
  dangerZone,
  shelters,
  firstPosition,
}: {
  dangerZone: DangerZones;
  shelters: Shelters;
  firstPosition: Vector2D;
}) {
  const startTime = useRef(new Date().getTime());
  const [position, setPosition] = useState<Vector2D>(firstPosition);
  const [currentDangerZone, setCurrentDangerZone] = useState<Vector2D[][]>([]);
  const [preDangerZone, setPreDangerZone] = useState<Vector2D[][]>([]);
  const [showPreDangerZone, setShowPreDangerZone] = useState(true);

  const fetchPosition = async () => {
    console.log(position);

    const [long, lat] = (await (
      await fetch("/last-location", { method: "GET" })
    ).json()) as Vector2D;

    setPosition([lat, long]);
    setShowPreDangerZone((pre) => !pre);

    const elapsedTime = new Date().getTime() - startTime.current;

    const currentDZ = dangerZone.find(({ time }) => time < elapsedTime);
    const preDZ = dangerZone.find(({ time }) => time < elapsedTime + 5000);

    setCurrentDangerZone((currentDZ?.areas as Vector2D[][]) ?? []);
    setPreDangerZone(
      (currentDZ === preDZ ? [] : (preDZ?.areas as Vector2D[][])) ?? [],
    );
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
      <Polygon pathOptions={{ color: "blue" }} positions={currentDangerZone} />
      <Polygon
        pathOptions={{ color: "blue", opacity: showPreDangerZone ? 100 : 0 }}
        positions={preDangerZone}
      />
    </MapContainer>
  );
}
