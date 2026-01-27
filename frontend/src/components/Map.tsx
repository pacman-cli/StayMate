"use client"

import L from "leaflet"
import Link from "next/link"
import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import { PropertyCardProps } from "./search/PropertyCard"

// Leaflet CSS is loaded via CDN in layout.tsx head to avoid sucrase parsing issues

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to update center when properties change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

interface MapProps {
  properties: PropertyCardProps[]
  center?: [number, number]
  zoom?: number
}

// Custom DivIcon for Price Markers
const createPriceIcon = (price: string) => {
  return new L.DivIcon({
    className: 'custom-price-marker',
    html: `<div class="bg-white text-slate-900 font-bold px-2 py-1 rounded-lg shadow-md border border-slate-200 text-xs hover:scale-110 transition-transform hover:z-50 hover:bg-slate-50 whitespace-nowrap">
                ${price}
               </div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 30]
  })
}

const Map = ({ properties, center = [23.8103, 90.4125], zoom = 13 }: MapProps) => { // Default to Dhaka

  // Calculate center if properties exist
  const effectiveCenter: [number, number] = properties.length > 0 && properties[0].latitude && properties[0].longitude
    ? [properties[0].latitude, properties[0].longitude]
    : center

  return (
    <MapContainer
      center={effectiveCenter}
      zoom={zoom}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={effectiveCenter} />

      {properties.map((property) => (
        property.latitude && property.longitude && (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createPriceIcon(property.price)}
          >
            <Popup className="custom-popup">
              <div className="w-48 p-1">
                <div className="aspect-video relative rounded-lg overflow-hidden mb-2">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">{property.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-1 mb-2">{property.address}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">{property.price}</span>
                  <Link href={`/search/${property.id}`} className="text-xs bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200 transition">
                    View
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}

export default Map
