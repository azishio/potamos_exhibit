"use client";

import { useState } from "react";
import { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import { readFile } from "fs/promises";
import { ShelterList } from "@/@type/shelterList";

const MapComponent = dynamic(() => import("./Map"), { ssr: false });

export default async function MapPage() {
  const [position, setPosition] = useState(new LatLng(36.247555, 139.523918));

  const shelters: ShelterList =
    JSON.parse(await readFile("/data/shelter.json", "utf-8")) ?? [];

  setInterval(async () => {
    const data = await fetch("/last-location", {
      method: "GET",
    });
    if (data.ok) {
      const [long, lat]: [number, number] = await data.json();

      setPosition(new LatLng(lat, long));
    }
  }, 1000);

  return (
    <main>
      <MapComponent position={position} shelters={shelters} />
    </main>
  );
}
