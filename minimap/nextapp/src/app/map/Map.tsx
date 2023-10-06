"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { icon, LatLng, LatLngExpression } from "leaflet";
import { ShelterList } from "@/@type/shelterList";

export default function Map({
  position,
  shelters,
}: {
  position: LatLngExpression;
  shelters: ShelterList;
}) {
  const MapContainerStyle = {
    width: "100vw",
    height: "100vh",
  };

  return (
    <MapContainer zoom={13} style={MapContainerStyle} center={position}>
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
      />
      <Marker
        position={position}
        icon={icon({ iconUrl: "/marker.svg", iconSize: [100, 100] })}
      />
      {shelters.map(({ coordinate: [long, lat], name }) => (
        <Marker
          position={new LatLng(lat, long)}
          icon={icon({ iconUrl: "/safetyMaker.svg", iconSize: [50, 50] })}
        >
          <Popup>{name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
