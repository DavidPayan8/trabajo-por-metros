import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Button } from './ui/Button'

interface LocationPickerProps {
  isOpen: boolean
  initial?: string
  onConfirm: (ubicacion: string) => void
  onCancel: () => void
}

interface PlaceSuggestion {
  placeId: string
  text: string
  secondaryText: string
}

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const LIBRARIES: ('places')[] = ['places']
const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 } // Madrid

type Mode = 'buscar' | 'mapa'

export function LocationPicker({ isOpen, initial = '', onConfirm, onCancel }: LocationPickerProps) {
  const [mode, setMode] = useState<Mode>('buscar')
  const [query, setQuery] = useState(initial)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState(initial)

  // Mapa
  const [pin, setPin] = useState<google.maps.LatLngLiteral | null>(null)
  const [mapAddress, setMapAddress] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [gpsLoading, setGpsLoading] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GMAPS_KEY ?? '',
    libraries: LIBRARIES,
  })

  useEffect(() => {
    if (isOpen) {
      setQuery(initial)
      setSelected(initial)
      setSuggestions([])
      setSearchError(null)
      setMode('buscar')
      setPin(null)
      setMapAddress('')
    }
  }, [isOpen, initial])

  // Autocomplete search
  useEffect(() => {
    if (mode !== 'buscar') return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (trimmed.length < 3 || trimmed === selected) {
      setSuggestions([])
      setSearchError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)
      try {
        const results = GMAPS_KEY
          ? await searchGoogle(trimmed)
          : await searchNominatim(trimmed)
        setSuggestions(results)
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : 'Error al buscar')
        setSuggestions([])
      }
      setSearching(false)
    }, 400)
  }, [query, mode, selected])

  const handleSelect = (s: PlaceSuggestion) => {
    setSelected(s.text)
    setQuery(s.text)
    setSuggestions([])
  }

  // Map click → place pin → reverse geocode
  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    setPin(coords)
    setGeocoding(true)
    setMapAddress('')
    try {
      let address: string | null = null
      if (GMAPS_KEY) {
        try { address = await reverseGeocodeGoogle(coords.lat, coords.lng) } catch { /* fallback */ }
      }
      if (!address) {
        address = await reverseGeocodeNominatim(coords.lat, coords.lng)
      }
      setMapAddress(address)
    } catch {
      setMapAddress('')
    }
    setGeocoding(false)
  }, [])

  const handleGpsCenter = () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        setMapCenter(pos)
        mapRef.current?.panTo(pos)
        mapRef.current?.setZoom(17)
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleConfirmMap = () => {
    if (mapAddress.trim()) onConfirm(mapAddress.trim())
  }

  if (!isOpen) return null

  const showSuggestions = suggestions.length > 0 && mode === 'buscar'
  const noResults =
    mode === 'buscar' &&
    query.trim().length >= 3 &&
    !searching &&
    !searchError &&
    suggestions.length === 0 &&
    query !== selected

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 ios-blur" />

      <div
        className="relative w-full max-w-[600px] mx-auto bg-surface-grouped rounded-t-2xl shadow-xl animate-[slide-up_0.25s_ease-out] flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        <div className="px-margin-main pb-2 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-headline-md-mobile text-charcoal-text">Ubicación del trabajo</h3>
            <div className="flex items-center gap-1 text-label-md text-ios-gray">
              <span className="material-symbols-outlined text-[14px]">
                {GMAPS_KEY ? 'verified' : 'public'}
              </span>
              {GMAPS_KEY ? 'Google Maps' : 'OpenStreetMap'}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 bg-surface-container rounded-xl p-1">
            {(['buscar', 'mapa'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setSuggestions([]); setSearchError(null) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-label-lg transition-all
                  ${mode === m ? 'bg-white text-ios-blue shadow-sm' : 'text-ios-gray'}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {m === 'buscar' ? 'search' : 'map'}
                </span>
                {m === 'buscar' ? 'Buscar' : 'Mapa'}
              </button>
            ))}
          </div>
        </div>

        {/* BUSCAR */}
        {mode === 'buscar' && (
          <div className="px-margin-main pb-6 flex flex-col gap-3 overflow-y-auto">
            <div>
              <label className="text-label-lg text-charcoal-text ml-1 mb-1.5 block">Dirección</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {searching
                    ? <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-ios-gray text-[20px]">location_on</span>
                  }
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected('') }}
                  placeholder="Escribe una dirección..."
                  autoFocus
                  autoComplete="off"
                  className={`w-full min-h-[44px] pl-11 pr-4 bg-surface-container-low border border-outline-variant/30 text-body-lg text-charcoal-text placeholder-ios-gray focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue transition-all
                    ${showSuggestions ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'}`}
                />
              </div>

              {showSuggestions && (
                <div className="bg-surface-container-low border border-outline-variant/30 border-t-0 rounded-b-xl overflow-hidden divide-y divide-outline-variant/20">
                  {suggestions.map((s) => (
                    <button
                      key={s.placeId}
                      onClick={() => handleSelect(s)}
                      className="w-full px-4 py-3 text-left flex items-start gap-3 active:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-ios-blue text-[18px] mt-0.5 shrink-0">location_on</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-body-md text-charcoal-text font-medium">{s.text}</span>
                        {s.secondaryText && (
                          <span className="text-label-md text-ios-gray">{s.secondaryText}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="mt-2 px-3 py-2 bg-error-container/30 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-ios-red text-[18px] shrink-0 mt-0.5">error</span>
                  <p className="text-label-lg text-ios-red">{searchError}</p>
                </div>
              )}

              {noResults && (
                <p className="text-label-lg text-ios-gray mt-2 ml-1">
                  Sin resultados. Puedes confirmar la dirección tal como está.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => { if (query.trim()) onConfirm(query.trim()) }} disabled={!query.trim()} className="flex-1" icon="check">
                Confirmar
              </Button>
              <Button variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
            </div>
          </div>
        )}

        {/* MAPA */}
        {mode === 'mapa' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Mapa */}
            <div className="relative mx-margin-main rounded-2xl overflow-hidden border border-black/5" style={{ height: '320px' }}>
              {!GMAPS_KEY ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low gap-2">
                  <span className="material-symbols-outlined text-ios-gray text-[48px]">map</span>
                  <p className="text-body-md text-ios-gray text-center px-4">
                    El mapa requiere una API key de Google Maps.
                  </p>
                </div>
              ) : !isLoaded ? (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                  <span className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={13}
                  onClick={handleMapClick}
                  onLoad={(map) => { mapRef.current = map }}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    gestureHandling: 'greedy',
                  }}
                >
                  {pin && <Marker position={pin} />}
                </GoogleMap>
              )}

              {/* Botón GPS sobre el mapa */}
              {GMAPS_KEY && isLoaded && (
                <button
                  onClick={handleGpsCenter}
                  className="absolute top-3 right-3 h-10 w-10 bg-white rounded-full shadow-md flex items-center justify-center text-ios-blue active:bg-surface-container-high transition-colors"
                >
                  {gpsLoading
                    ? <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[20px]">my_location</span>
                  }
                </button>
              )}

              {/* Hint */}
              {GMAPS_KEY && isLoaded && !pin && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-label-lg px-3 py-1.5 rounded-full whitespace-nowrap">
                  Toca el mapa para marcar
                </div>
              )}
            </div>

            {/* Dirección detectada */}
            <div className="px-margin-main py-3 flex flex-col gap-3">
              {pin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-lg text-charcoal-text ml-1">Dirección seleccionada</label>
                  {geocoding ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl">
                      <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-body-md text-ios-gray">Obteniendo dirección...</span>
                    </div>
                  ) : (
                    <textarea
                      value={mapAddress}
                      onChange={(e) => setMapAddress(e.target.value)}
                      rows={2}
                      placeholder="Dirección detectada..."
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-md text-charcoal-text focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue transition-all resize-none"
                    />
                  )}
                </div>
              )}

              {!pin && (
                <p className="text-body-md text-ios-gray text-center py-2">
                  Toca el mapa para colocar un pin en la ubicación del trabajo.
                </p>
              )}

              <div className="flex gap-2 pb-4">
                <Button
                  onClick={handleConfirmMap}
                  disabled={!mapAddress.trim() || geocoding}
                  className="flex-1"
                  icon="check"
                >
                  Confirmar
                </Button>
                <Button variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Google ───────────────────────────────────────────────────────────────────

async function searchGoogle(input: string): Promise<PlaceSuggestion[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GMAPS_KEY! },
    body: JSON.stringify({ input }),
  })
  const data = await res.json() as Record<string, unknown>
  if (!res.ok) {
    const err = data as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `HTTP ${res.status}`)
  }
  const suggestions = (data.suggestions ?? []) as Array<{
    placePrediction: {
      placeId: string
      text: { text: string }
      structuredFormat?: { mainText: { text: string }; secondaryText?: { text: string } }
    }
  }>
  return suggestions.map((s) => ({
    placeId: s.placePrediction.placeId,
    text: s.placePrediction.structuredFormat?.mainText.text ?? s.placePrediction.text.text,
    secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
  }))
}

async function reverseGeocodeGoogle(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY!}&language=es`
  )
  const data = await res.json() as { status: string; results: Array<{ formatted_address: string }> }
  if (data.status !== 'OK') throw new Error(`Geocoding: ${data.status}`)
  return data.results[0].formatted_address
}

// ─── Nominatim fallback ───────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number; display_name: string
  address: { road?: string; house_number?: string; city?: string; town?: string; village?: string; state?: string }
}

async function searchNominatim(query: string): Promise<PlaceSuggestion[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'es' } }
  )
  const data = await res.json() as NominatimResult[]
  return data.map((r) => ({ placeId: String(r.place_id), text: fmtNominatim(r), secondaryText: '' }))
}

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { 'Accept-Language': 'es' } }
  )
  return fmtNominatim(await res.json() as NominatimResult)
}

function fmtNominatim(r: NominatimResult): string {
  const a = r.address
  const street = [a.road, a.house_number].filter(Boolean).join(' ')
  const city = a.city ?? a.town ?? a.village ?? ''
  return [street, city, a.state].filter(Boolean).join(', ') || r.display_name
}
