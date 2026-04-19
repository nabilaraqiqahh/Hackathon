import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useData } from '../context/DataContext';

const OCM_API_KEY = "292877f3-6142-4c76-b36b-fb1f0524e86d";

// ─────────────────────────────────────────────
//  MELAKA TRUE BORDER (polygon point-in-polygon)
//  Coordinates traced along the actual state boundary.
//  This is far more accurate than a rectangle
// ─────────────────────────────────────────────
const MELAKA_POLYGON = [
  [2.505, 102.150], // NW corner (Alor Gajah north-west)
  [2.510, 102.220],
  [2.480, 102.280],
  [2.450, 102.300],
  [2.430, 102.350],
  [2.420, 102.390],
  [2.400, 102.420],
  [2.380, 102.440],
  [2.350, 102.455], // NE (Jasin north-east)
  [2.300, 102.460],
  [2.260, 102.450],
  [2.230, 102.440],
  [2.200, 102.420],
  [2.160, 102.380],
  [2.130, 102.340],
  [2.110, 102.290],
  [2.100, 102.240],
  [2.105, 102.190],
  [2.120, 102.150],
  [2.150, 102.140],
  [2.200, 102.130],
  [2.280, 102.130],
  [2.350, 102.140],
  [2.420, 102.140],
  [2.470, 102.145],
  [2.505, 102.150], // close polygon
];

// Ray-casting point-in-polygon test
function isInsideMelaka(lat, lng) {
  const poly = MELAKA_POLYGON;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Rectangular envelope for fast pre-check (avoids polygon test on obvious misses)
const MELAKA_SW     = [2.09,  102.12];
const MELAKA_NE     = [2.515, 102.47];
const MELAKA_BOUNDS = L.latLngBounds(MELAKA_SW, MELAKA_NE);
const MELAKA_CENTER = [2.2900, 102.3000];
const MELAKA_MIN_ZOOM = 11;

function isInMelakaRect(lat, lng) {
  return (
    lat >= MELAKA_SW[0] && lat <= MELAKA_NE[0] &&
    lng >= MELAKA_SW[1] && lng <= MELAKA_NE[1]
  );
}

// Combined check: must pass rectangle AND polygon
function isStrictlyInMelaka(lat, lng) {
  if (!isInMelakaRect(lat, lng)) return false;
  return isInsideMelaka(lat, lng);
}

// ── District bounding boxes ──
const DISTRICTS = {
  "Melaka Tengah": {
    latMin: 2.09, latMax: 2.30, lngMin: 102.17, lngMax: 102.40,
    bounds: L.latLngBounds([2.09, 102.17], [2.30, 102.40]),
  },
  "Alor Gajah": {
    latMin: 2.28, latMax: 2.515, lngMin: 102.12, lngMax: 102.34,
    bounds: L.latLngBounds([2.28, 102.12], [2.515, 102.34]),
  },
  "Jasin": {
    latMin: 2.17, latMax: 2.42, lngMin: 102.33, lngMax: 102.47,
    bounds: L.latLngBounds([2.17, 102.33], [2.42, 102.47]),
  },
};

function classifyDistrict(lat, lng, title = "", address = "", town = "") {
  const text = `${title} ${address} ${town}`.toLowerCase();
  if (text.includes("melaka tengah") || text.includes("bandar hilir") || text.includes("ayer keroh") || text.includes("bukit baru")) return "Melaka Tengah";
  if (text.includes("alor gajah") || text.includes("masjid tanah") || text.includes("simpang ampat")) return "Alor Gajah";
  if (text.includes("jasin") || text.includes("merlimau") || text.includes("selandar")) return "Jasin";

  // GPS fallback — Jasin is east, Alor Gajah is north-west, Melaka Tengah is south-central
  if (lng >= 102.33 && lat >= 2.17 && lat <= 2.42) return "Jasin";
  if (lat >= 2.28 && lng <= 102.34) return "Alor Gajah";
  if (lat <= 2.30 && lng >= 102.17 && lng <= 102.40) return "Melaka Tengah";
  return "Other";
}

// Fix Leaflet icon with Vite/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      transform:rotate(-45deg);position:relative;">
      <span style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;transform:rotate(45deg);font-size:12px;color:#fff;">⚡</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -34],
  });
}

const STATUS_COLOR = { available: "#22c55e", maintenance: "#f59e0b", full: "#ef4444", unknown: "#94a3b8" };
const STATUS_LABEL = { available: "Available", maintenance: "Maintenance", full: "Full", unknown: "Unknown" };

function deriveStatus(poi) {
  const id = poi.StatusType?.ID;
  if (id === 50)  return "available";
  if (id === 75)  return "maintenance";
  if (id === 210) return "full";
  return "unknown";
}

function MapController({ district, selectedStation }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MELAKA_BOUNDS, { padding: [20, 20] });
    setTimeout(() => map.setMinZoom(MELAKA_MIN_ZOOM), 600);
  }, [map]);

  useEffect(() => {
    if (district === "All Districts") {
      map.flyToBounds(MELAKA_BOUNDS, { padding: [20, 20], duration: 1.2 });
    } else if (DISTRICTS[district]) {
      map.flyToBounds(DISTRICTS[district].bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [district, map]);

  useEffect(() => {
    if (selectedStation?.lat && selectedStation?.lng)
      map.flyTo([selectedStation.lat, selectedStation.lng], 16, { duration: 1 });
  }, [selectedStation, map]);

  return null;
}

const MapExplorer = () => {
  const { stations: contextStations } = useData();

  const [stations, setStations]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [district, setDistrict]               = useState("All Districts");
  const [availability, setAvailability]       = useState("All Status");
  const [chargerType, setChargerType]         = useState("All Types");
  const [lastUpdated, setLastUpdated]         = useState(null);
  const intervalRef = useRef(null);

  async function fetchStations() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        key: OCM_API_KEY,
        latitude: MELAKA_CENTER[0], longitude: MELAKA_CENTER[1],
        distance: 35, distanceunit: "KM",   // tighter radius — 35km covers all of Melaka
        maxresults: 100, compact: true, verbose: false,
        output: "json", countrycode: "MY",
      });

      const res  = await fetch(`https://api.openchargemap.io/v3/poi/?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const mapped = data.map((poi) => {
        const conns  = poi.Connections || [];
        const types  = [...new Set(conns.map((c) => {
          const t = c.ConnectionType?.Title || "";
          if (t.includes("CHAdeMO") || t.includes("CCS") || t.toLowerCase().includes("dc")) return "DC";
          if (t.toLowerCase().includes("fast")) return "DC Fast";
          return "AC Standard";
        }))];
        const lat     = poi.AddressInfo?.Latitude;
        const lng     = poi.AddressInfo?.Longitude;
        const title   = poi.AddressInfo?.Title || "";
        const address = poi.AddressInfo?.AddressLine1 || "";
        const town    = poi.AddressInfo?.Town || "";

        return {
          id:          poi.ID,
          name:        title || "Unknown Station",
          address,
          town,
          district:    classifyDistrict(lat, lng, title, address, town),
          lat,
          lng,
          status:      deriveStatus(poi),
          type:        types[0] || "AC Standard",
          usageCost:   poi.UsageCost || null,
          operator:    poi.OperatorInfo?.Title || "Unknown Operator",
          connections: conns.length || 1,
        };
      }).filter((s) =>
        // ✅ Strict polygon filter — excludes Tangkak, Johor & N. Sembilan border areas
        s.lat && s.lng && isStrictlyInMelaka(s.lat, s.lng)
      );

      setStations(mapped);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStations();
    intervalRef.current = setInterval(fetchStations, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  function handleDistrictChange(val) {
    setDistrict(val);
    setSelectedStation(null);
  }

  const filtered = stations.filter((s) => {
    if (district !== "All Districts" && s.district !== district) return false;
    if (availability === "Available" && s.status !== "available") return false;
    if (availability === "Maintenance"      && s.status !== "maintenance")      return false;
    if (availability === "Full"      && s.status !== "full")      return false;
    if (chargerType !== "All Types"  && s.type !== chargerType)   return false;
    return true;
  });

  const selectStyle = {
    width: '100%', padding: '7px 10px', borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.85rem',
    marginBottom: 10, background: '#fafafa', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    color: 'var(--color-text-muted)', marginBottom: 4,
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Map Explorer</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Real-time EV charging stations across Melaka.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_COLOR).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v }} />
              {STATUS_LABEL[k]}
            </div>
          ))}
          {lastUpdated && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>🔄 {lastUpdated}</span>}
          <button
            onClick={fetchStations} disabled={loading} className="btn-export"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', minHeight: 0 }}>

        {/* Map */}
        <div className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
          {district !== "All Districts" && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 1000,
              background: 'var(--color-primary, #7a1212)', color: '#fff',
              padding: '6px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              📍 {district}
              <button onClick={() => handleDistrictChange("All Districts")} style={{
                background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff',
                width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          )}

          <MapContainer
            center={MELAKA_CENTER} zoom={MELAKA_MIN_ZOOM}
            style={{ width: '100%', height: '100%' }}
            zoomControl maxBounds={MELAKA_BOUNDS}
            maxBoundsViscosity={1.0} minZoom={MELAKA_MIN_ZOOM} maxZoom={18}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController district={district} selectedStation={selectedStation} />
            {filtered.map((s) =>
              s.lat && s.lng ? (
                <Marker
                  key={s.id} position={[s.lat, s.lng]}
                  icon={createIcon(STATUS_COLOR[s.status])}
                  eventHandlers={{ click: () => setSelectedStation(s) }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <strong style={{ display: 'block', marginBottom: 4 }}>{s.name}</strong>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>{[s.address, s.town].filter(Boolean).join(', ')}</p>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>District: <b>{s.district}</b></p>
                      <p style={{ margin: '4px 0', fontSize: 12 }}>
                        <span style={{ color: STATUS_COLOR[s.status], fontWeight: 700 }}>● {STATUS_LABEL[s.status]}</span>
                        {' · '}{s.type}
                      </p>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>{s.connections} connector{s.connections !== 1 ? 's' : ''}</p>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>Operator: {s.operator}</p>
                      {s.usageCost && <p style={{ margin: '2px 0', fontSize: 12 }}>Cost: {s.usageCost}</p>}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>▽ Filters &amp; Stations</h3>
          </div>

          <div className="card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>

            {/* Filters */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <label style={labelStyle}>District</label>
              <select style={selectStyle} value={district} onChange={(e) => handleDistrictChange(e.target.value)}>
                <option>All Districts</option>
                <option>Melaka Tengah</option>
                <option>Alor Gajah</option>
                <option>Jasin</option>
              </select>
              <label style={labelStyle}>Availability</label>
              <select style={selectStyle} value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option>All Status</option>
                <option>Available</option>
                <option>Maintenance</option>
                <option>Full</option>
              </select>
              <label style={labelStyle}>Charger Type</label>
              <select style={{ ...selectStyle, marginBottom: 0 }} value={chargerType} onChange={(e) => setChargerType(e.target.value)}>
                <option>All Types</option>
                <option>Fast DC(60kW+)</option>
                <option>AC Standard(22kW+)</option>
                <option>Ultra Fast(150kW+)</option>
              </select>
            </div>

            {error && (
              <div style={{ margin: '10px 16px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: '0.8rem', color: '#991b1b' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ padding: '8px 16px', fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              {loading ? 'Fetching live data…' : `${filtered.length} station${filtered.length !== 1 ? 's' : ''} found${district !== 'All Districts' ? ` in ${district}` : ' across Melaka'}`}
            </div>

            {/* Station list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', gap: 12, color: 'var(--color-text-muted)' }}>
                  <div style={{ width: 26, height: 26, border: '3px solid #eee', borderTopColor: 'var(--color-primary, #7a1212)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>Loading real-time data…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  No stations match the selected filters.
                </div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id} onClick={() => setSelectedStation(s)}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      background: selectedStation?.id === s.id ? 'rgba(122,18,18,0.05)' : 'transparent',
                      borderLeft: selectedStation?.id === s.id ? '3px solid var(--color-primary, #7a1212)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</span>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[s.status], flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {s.district !== 'Other' ? s.district : s.town || s.address}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{s.connections} connector{s.connections !== 1 ? 's' : ''}</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary, #7a1212)' }}>{s.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Station detail / hint */}
            {selectedStation ? (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '14px 16px', background: '#fff', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <strong style={{ fontSize: '0.88rem', lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{selectedStation.name}</strong>
                  <button onClick={() => setSelectedStation(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {[selectedStation.address, selectedStation.town].filter(Boolean).join(', ')}
                </p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                    <div style={{ fontWeight: 700, color: STATUS_COLOR[selectedStation.status], fontSize: '0.85rem' }}>● {STATUS_LABEL[selectedStation.status]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedStation.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Connectors</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedStation.connections}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  Operator: {selectedStation.operator}{selectedStation.usageCost && ` · ${selectedStation.usageCost}`}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'rgba(212,175,55,0.08)', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MapExplorer;