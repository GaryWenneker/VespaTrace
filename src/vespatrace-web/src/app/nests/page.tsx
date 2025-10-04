"use client"
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type * as LType from 'leaflet'

type Feature = {
  type: 'Feature'
  id: string
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: { species?: string; found_at: string; removed_at?: string | null; notes?: string; active: boolean }
}
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }

export default function NestsPage() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: LType.Map | null = null
    const markers: LType.Marker[] = []
    async function init() {
      const L: typeof LType = await import('leaflet')
  // Default icon assets fix for Leaflet in bundlers
  type Proto = { [k: string]: unknown }
  const iconDefaultProto = (L as unknown as { Icon: { Default: { prototype: Proto } } }).Icon.Default.prototype
  if ('_getIconUrl' in iconDefaultProto) delete (iconDefaultProto as Proto)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      })

      if (!mapRef.current) return
      map = L.map(mapRef.current).setView([52.1, 5.3], 8)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const res = await fetch('/api/nests')
      const data: FeatureCollection = await res.json()
      for (const f of data.features) {
        const [lon, lat] = f.geometry.coordinates
        const m = L.marker([lat, lon]).addTo(map)
        m.bindPopup(`ID: ${f.id}<br/>Found: ${new Date(f.properties.found_at).toLocaleString()}<br/>Status: ${f.properties.active ? 'Actief' : 'Verwijderd'}`)
        markers.push(m)
      }
    }
    init()
    return () => {
      markers.forEach((m) => m.remove())
      if (map) map.remove()
    }
  }, [])

  return <div ref={mapRef} className="w-full h-[calc(100vh-4rem)]" />
}
