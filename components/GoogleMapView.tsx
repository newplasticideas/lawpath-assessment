"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type Props = {
  lat: number;
  lng: number;
};

const containerStyle = {
  width: "100%",
  height: "400px", // was 300px
};

export function GoogleMapView({ lat, lng }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={15}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
}
