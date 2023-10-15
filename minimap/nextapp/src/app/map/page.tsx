import dynamic from "next/dynamic";
import { readDangerZone, readShelter } from "@/data/readFiles";
import { gameState } from "@/data/data";

const MapComponent = dynamic(() => import("./Map"), { ssr: false });

export default async function MapPage() {
  const dangerZone = (await readDangerZone()).sort((a, b) => b.time - a.time);
  const shelters = await readShelter();
  const [long, lat] = gameState.content.getLastCoordinate();

  gameState.content.setStartTime();

  return (
    <main>
      <MapComponent
        startTime={gameState.content.startTime}
        dangerZones={dangerZone}
        shelters={shelters}
        firstPosition={[lat, long]}
      />
    </main>
  );
}
