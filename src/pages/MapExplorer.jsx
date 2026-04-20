import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useData } from '../context/DataContext';

const OCM_API_KEY = "292877f3-6142-4c76-b36b-fb1f0524e86d";

const MELAKA_POLYGON = [
  [2.505,102.150],[2.510,102.220],[2.480,102.280],[2.450,102.300],
  [2.430,102.350],[2.420,102.390],[2.400,102.420],[2.380,102.440],
  [2.350,102.455],[2.300,102.460],[2.260,102.450],[2.230,102.440],
  [2.200,102.420],[2.160,102.380],[2.130,102.340],[2.110,102.290],
  [2.100,102.240],[2.105,102.190],[2.120,102.150],[2.150,102.140],
  [2.200,102.130],[2.280,102.130],[2.350,102.140],[2.420,102.140],
  [2.470,102.145],[2.505,102.150],
];

function isInsideMelaka(lat, lng) {
  let inside = false;
  for (let i = 0, j = MELAKA_POLYGON.length - 1; i < MELAKA_POLYGON.length; j = i++) {
    const [yi, xi] = MELAKA_POLYGON[i];
    const [yj, xj] = MELAKA_POLYGON[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const MELAKA_SW       = [2.09,  102.12];
const MELAKA_NE       = [2.515, 102.47];
const MELAKA_BOUNDS   = L.latLngBounds(MELAKA_SW, MELAKA_NE);
const MELAKA_CENTER   = [2.2900, 102.3000];
const MELAKA_MIN_ZOOM = 11;

function isInMelakaRect(lat, lng) {
  return lat >= MELAKA_SW[0] && lat <= MELAKA_NE[0] && lng >= MELAKA_SW[1] && lng <= MELAKA_NE[1];
}
function isStrictlyInMelaka(lat, lng) {
  return isInMelakaRect(lat, lng) && isInsideMelaka(lat, lng);
}

const DISTRICTS = {
  "Melaka Tengah": { bounds: L.latLngBounds([2.09, 102.17], [2.30, 102.40]) },
  "Alor Gajah":   { bounds: L.latLngBounds([2.28, 102.12], [2.515, 102.34]) },
  "Jasin":        { bounds: L.latLngBounds([2.17, 102.33], [2.42, 102.47]) },
};

function classifyDistrict(lat, lng, title = "", address = "", town = "") {
  const text = `${title} ${address} ${town}`.toLowerCase();
  if (text.includes("melaka tengah") || text.includes("bandar hilir") || text.includes("ayer keroh") || text.includes("bukit baru")) return "Melaka Tengah";
  if (text.includes("alor gajah") || text.includes("masjid tanah") || text.includes("simpang ampat")) return "Alor Gajah";
  if (text.includes("jasin") || text.includes("merlimau") || text.includes("selandar")) return "Jasin";
  if (lng >= 102.33 && lat >= 2.17 && lat <= 2.42) return "Jasin";
  if (lat >= 2.28 && lng <= 102.34) return "Alor Gajah";
  if (lat <= 2.30 && lng >= 102.17 && lng <= 102.40) return "Melaka Tengah";
  return "Other";
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


function createIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      transform:rotate(-45deg);position:relative;">
      <span style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;transform:rotate(45deg);font-size:12px;color:#fff;">⚡</span>
    </div>`,
    iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -34],
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

const StatusBadge = ({ status }) => {
  const colors = { available: '#22c55e', maintenance: '#f59e0b', full: '#ef4444', unknown: '#94a3b8' };
  const labels = { available: 'Available', maintenance: 'Maintenance', full: 'Full', unknown: 'Unknown' };
  const color = colors[status] || colors.unknown;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
      background: `${color}22`, color, display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {labels[status] || status}
    </span>
  );
};

const FilterIcon = ({ active }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: 18 }}>
    <div style={{ height: 2, borderRadius: 2, background: active ? '#fff' : 'currentColor', width: '100%' }} />
    <div style={{ height: 2, borderRadius: 2, background: active ? '#fff' : 'currentColor', width: '75%' }} />
    <div style={{ height: 2, borderRadius: 2, background: active ? '#fff' : 'currentColor', width: '50%' }} />
  </div>
);

function MapController({ district, selectedStation }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(MELAKA_BOUNDS, { padding: [20, 20] });
    setTimeout(() => map.setMinZoom(MELAKA_MIN_ZOOM), 600);
  }, [map]);
  useEffect(() => {
    if (district === "All Districts") map.flyToBounds(MELAKA_BOUNDS, { padding: [20, 20], duration: 1.2 });
    else if (DISTRICTS[district]) map.flyToBounds(DISTRICTS[district].bounds, { padding: [50, 50], duration: 1.2 });
  }, [district, map]);
  useEffect(() => {
    if (selectedStation?.lat && selectedStation?.lng)
      map.flyTo([selectedStation.lat, selectedStation.lng], 16, { duration: 1 });
  }, [selectedStation, map]);
  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const MapExplorer = () => {
  const { isLocationEnabled, toggleLocation, currentUser, reserveStation } = useData();
  const navigate = useNavigate();

  const [stations, setStations]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [lastUpdated, setLastUpdated]         = useState(null);
  const intervalRef                           = useRef(null);
  const filterRef                             = useRef(null);

  const [selectedStation, setSelectedStation] = useState(null);
  const [userLocation, setUserLocation]       = useState(null);

  const [searchQuery, setSearchQuery]         = useState("");
  const [district, setDistrict]               = useState("All Districts");
  const [availability, setAvailability]       = useState("All Status");
  const [chargerType, setChargerType]         = useState("All Types");
  const [filtersOpen, setFiltersOpen]         = useState(false);

  const activeFilterCount = [
    district !== "All Districts",
    availability !== "All Status",
    chargerType !== "All Types",
  ].filter(Boolean).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtersOpen]);

  async function fetchStations() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        key: OCM_API_KEY,
        latitude: MELAKA_CENTER[0], longitude: MELAKA_CENTER[1],
        distance: 10, distanceunit: "KM",
        maxresults: 100, compact: true, verbose: false,
        output: "json", countrycode: "MY",
      });
      const res  = await fetch(`https://api.openchargemap.io/v3/poi/?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const mapped = data.map((poi) => {
        const conns = poi.Connections || [];
        const types = [...new Set(conns.map((c) => {
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
          id: poi.ID, name: title || "Unknown Station",
          address, town,
          district: classifyDistrict(lat, lng, title, address, town),
          lat, lng,
          status:      deriveStatus(poi),
          type:        types[0] || "AC Standard",
          usageCost:   poi.UsageCost || null,
          operator:    poi.OperatorInfo?.Title || "Unknown Operator",
          connections: conns.length || 1,
        };
      }).filter((s) => s.lat && s.lng && isStrictlyInMelaka(s.lat, s.lng));

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

  useEffect(() => {
    let watchId;
    if (isLocationEnabled && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setUserLocation(null);
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isLocationEnabled]);

  function handleDistrictChange(val) {
    setDistrict(val);
    setSelectedStation(null);
  }

  function resetFilters() {
    setDistrict("All Districts");
    setAvailability("All Status");
    setChargerType("All Types");
  }

  const filtered = stations.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = s.name.toLowerCase().includes(q) ||
                    s.address.toLowerCase().includes(q) ||
                    s.town.toLowerCase().includes(q) ||
                    s.operator.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (district !== "All Districts" && s.district !== district) return false;
    if (availability === "Available"   && s.status !== "available")   return false;
    if (availability === "Maintenance" && s.status !== "maintenance") return false;
    if (availability === "Full"        && s.status !== "full")        return false;
    if (chargerType  !== "All Types"   && s.type   !== chargerType)   return false;
    return true;
  });

  const sortedStations = [...filtered].map((s) => ({
    ...s,
    distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], s.lat, s.lng) : null,
  })).sort((a, b) => {
    if (a.distance === null || b.distance === null) return 0;
    return a.distance - b.distance;
  });

  const selectStyle = {
    width: '100%', padding: '7px 10px', borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.85rem',
    background: '#fafafa', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    color: 'var(--color-text-muted)', marginBottom: 4,
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <div className="mb-3">

        {/* Row 1: Title + right controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0' }}>Map Explorer</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Real-time EV charging stations across Melaka.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            {Object.entries(STATUS_COLOR).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: v, flexShrink: 0 }} />
                {STATUS_LABEL[k]}
              </div>
            ))}
            {lastUpdated && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🔄 {lastUpdated}</span>
            )}
            {/* Location toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '30px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isLocationEnabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                Location {isLocationEnabled ? 'ON' : 'OFF'}
              </span>
              <button onClick={toggleLocation} style={{
                width: '40px', height: '22px', borderRadius: '11px',
                background: isLocationEnabled ? 'var(--color-success)' : '#ccc',
                position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0,
              }}>
                <div style={{
                  width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                  position: 'absolute', top: '3px',
                  left: isLocationEnabled ? '21px' : '3px', transition: 'all 0.3s',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search bar with inline filter icon at right end */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }} ref={filterRef}>

            {/* Search icon left */}
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', pointerEvents: 'none', zIndex: 1,
            }} />

            {/* Input */}
            <input
              type="text"
              placeholder="Search station, operator, or area…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '50%', padding: '9px 80px 9px 36px',
                borderRadius: 10, border: `1px solid ${filtersOpen ? 'var(--color-primary, #7a1212)' : 'rgba(0,0,0,0.12)'}`,
                fontSize: '0.85rem', background: 'white', outline: 'none',
                boxShadow: 'var(--shadow-sm)', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary, #7a1212)'}
              onBlur={(e) => { if (!filtersOpen) e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
            />

            {/* Right side: clear X + divider + filter icon */}
            <div style={{
              position: 'absolute', right: 598, top: 0, bottom: 0,
              display: 'flex', alignItems: 'center', gap: 0,
            }}>
              {/* Clear button */}
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                  padding: '0 6px', height: '100%',
                }}>
                  <X size={13} />
                </button>
              )}

              {/* Divider */}
              <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />

              {/* Filter button */}
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                style={{
                  background: filtersOpen ? 'var(--color-primary, #7a1212)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 14px', height: '100%',
                  borderRadius: '0 9px 9px 0',
                  color: filtersOpen ? '#fff' : 'var(--color-text-muted, #555)',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <FilterIcon active={filtersOpen} />
                {activeFilterCount > 0 && (
                  <span style={{
                    background: filtersOpen ? 'rgba(255,255,255,0.35)' : 'var(--color-primary, #7a1212)',
                    color: '#fff', borderRadius: '50%',
                    width: 16, height: 16, fontSize: '0.62rem', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Dropdown */}
            {filtersOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                zIndex: 9999,
                background: 'white',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', color: 'var(--color-primary, #7a1212)',
                      fontWeight: 600, textDecoration: 'underline', padding: 0,
                    }}>
                      Reset all
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>District</label>
                    <select style={selectStyle} value={district} onChange={(e) => handleDistrictChange(e.target.value)}>
                      <option>All Districts</option>
                      <option>Melaka Tengah</option>
                      <option>Alor Gajah</option>
                      <option>Jasin</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Availability</label>
                    <select style={selectStyle} value={availability} onChange={(e) => setAvailability(e.target.value)}>
                      <option>All Status</option>
                      <option>Available</option>
                      <option>Maintenance</option>
                      <option>Full</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Charger Type</label>
                    <select style={selectStyle} value={chargerType} onChange={(e) => setChargerType(e.target.value)}>
                      <option>All Types</option>
                      <option>DC</option>
                      <option>DC Fast</option>
                      <option>AC Standard</option>
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                    {district !== "All Districts" && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(122,18,18,0.08)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary, #7a1212)' }}>
                        {district}
                        <button onClick={() => handleDistrictChange("All Districts")} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', lineHeight: 1 }}><X size={11} /></button>
                      </span>
                    )}
                    {availability !== "All Status" && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(122,18,18,0.08)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary, #7a1212)' }}>
                        {availability}
                        <button onClick={() => setAvailability("All Status")} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', lineHeight: 1 }}><X size={11} /></button>
                      </span>
                    )}
                    {chargerType !== "All Types" && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(122,18,18,0.08)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary, #7a1212)' }}>
                        {chargerType}
                        <button onClick={() => setChargerType("All Types")} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', lineHeight: 1 }}><X size={11} /></button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', minHeight: 0 }}>

        {/* ── MAP ── */}
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
                <Marker key={s.id} position={[s.lat, s.lng]}
                  icon={createIcon(STATUS_COLOR[s.status])}
                  eventHandlers={{ click: () => setSelectedStation(s) }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <strong style={{ display: 'block', marginBottom: 4 }}>{s.name}</strong>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>{[s.address, s.town].filter(Boolean).join(', ')}</p>
                      <p style={{ margin: '4px 0', fontSize: 12 }}>
                        <span style={{ color: STATUS_COLOR[s.status], fontWeight: 700 }}>● {STATUS_LABEL[s.status]}</span>
                        {' · '}{s.type}
                      </p>
                      <p style={{ margin: '2px 0', fontSize: 12 }}>Operator: {s.operator}</p>
                      {s.usageCost && <p style={{ margin: '2px 0', fontSize: 12 }}>Cost: {s.usageCost}</p>}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

            {isLocationEnabled && userLocation && (
              <CircleMarker center={userLocation}
                pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                radius={8}
              >
                <Popup><strong>You are here</strong></Popup>
              </CircleMarker>
            )}
          </MapContainer>

          {!isLocationEnabled && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}>
              <div className="card" style={{ maxWidth: '300px', textAlign: 'center', padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: '15px' }}>
                  <Navigation size={56} />
                </div>
                <h3>Location Required</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                  Please turn on your location to access the Melaka EV Network map and find nearby stations.
                </p>
                <button onClick={toggleLocation} className="login-btn" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
                  Enable Location Service
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="card" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {selectedStation ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Keep your existing detail view exactly as it is */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={selectedStation.status} />
                    <button onClick={() => setSelectedStation(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 13 }}>✕</button>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '1rem' }}>{selectedStation.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 0 4px 0', fontSize: '0.82rem' }}>
                  {[selectedStation.address, selectedStation.town].filter(Boolean).join(', ')}
                </p>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 0 16px 0', fontSize: '0.82rem' }}>
                  {selectedStation.district !== 'Other' ? selectedStation.district : ''}, Melaka
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Type', value: selectedStation.type },
                    { label: 'Connectors', value: selectedStation.connections },
                    { label: 'Operator', value: selectedStation.operator },
                    { label: 'Cost', value: selectedStation.usageCost || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '10px 12px', background: '#f8f8f8', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', wordBreak: 'break-word' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Nearby Stations</h3>
                </div>

                {!isLocationEnabled ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: '40px 20px' }}>
                    
                  </div>
                ) : !userLocation ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Waiting for location...
                  </div>
                ) : sortedStations.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    No stations match the selected filters.
                  </div>
                ) : (
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
                    {sortedStations.map((stn) => (
                      <div
                        key={stn.id}
                        onClick={() => setSelectedStation(stn)}
                        className="station-card"
                        style={{
                          padding: '12px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.2s',
                          background: selectedStation?.id === stn.id ? 'rgba(122,18,18,0.04)' : 'white',
                          borderLeft: selectedStation?.id === stn.id ? '3px solid var(--color-primary, #7a1212)' : '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stn.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                            {stn.distance !== null ? `${stn.distance.toFixed(1)} km away` : (stn.district !== 'Other' ? stn.district : stn.town)}
                          </div>
                        </div>
                        <StatusBadge status={stn.status} />
                      </div>
                    ))}
                  </div>
                )}
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
