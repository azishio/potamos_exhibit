import dynamic from "next/dynamic";
import { readDangerZone, readShelter } from "@/data/readFiles";
import { gameState } from "@/data/data";

const MapComponent = dynamic(() => import("./Map"), { ssr: false });

export default async function MapPage() {
  console.log(await readDangerZone());
  const dangerZone = (await readDangerZone()).sort((a, b) => b.time - a.time);
  const shelters = await readShelter();
  const [long, lat] = gameState.state.getLastCoordinate();

  return (
    <main>
      <MapComponent
        dangerZone={dangerZone}
        shelters={shelters}
        firstPosition={[lat, long]}
      />
    </main>
  );
}
