import React, { useMemo } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { Person } from '../../types';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { getLocationColor } from '../../lib/locationColors';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'Quetta': [66.9750, 30.1798],
  'Faisalabad': [73.0890, 31.4504],
  'Lahore': [74.3587, 31.5204],
  'Islamabad': [73.0479, 33.6844],
  'Multan': [71.4922, 30.1978],
  'Saudi Arabia': [45.0792, 23.8859],
  'Patti, India': [74.7570, 31.2818],
};

export default function MapView() {
  const store = useTreeStore();
  const persons = store.persons;

  // Calculate stats per location
  const locationStats = useMemo(() => {
    const stats: Record<string, { count: number, names: string[], coordinates: [number, number] }> = {};
    
    persons.forEach(person => {
      const loc = person.currentLocation;
      if (loc && LOCATION_COORDINATES[loc]) {
        if (!stats[loc]) {
          stats[loc] = { count: 0, names: [], coordinates: LOCATION_COORDINATES[loc] };
        }
        stats[loc].count += 1;
        if (stats[loc].names.length < 3) {
          stats[loc].names.push(`${person.firstName} ${person.lastName || ''}`.trim());
        }
      }
    });

    return Object.entries(stats).map(([name, data]) => ({ name, ...data }));
  }, [persons]);

  const handleMarkerClick = (locationName: string) => {
    // Clear current location filters
    store.clearFilters();
    store.toggleFilter('locations', locationName);
    
    if (!store.filterPanelOpen) {
      store.toggleFilterPanel();
    }
    store.setViewMode('list');
  };

  return (
    <div className="w-full h-full bg-[#1a1a2e] relative overflow-hidden flex items-center justify-center">
      <ComposableMap 
        projection="geoMercator"
        projectionConfig={{ scale: 1200, center: [65, 28] }}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#2a2a4a"
                stroke="#3f3f6a"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#35355e" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {locationStats.map(({ name, count, coordinates, names }) => {
          const locationColor = getLocationColor(name);
          return (
          <Marker 
            key={name}
            coordinates={coordinates}
            onClick={() => handleMarkerClick(name)}
          >
            {/* Pulsating outline / glow - 50% smaller */}
            <circle 
              r={6 + (count * 0.15)} 
              fill={locationColor}
              fillOpacity="0.2"
              stroke={locationColor}
              strokeWidth="1.5"
              className="animate-pulse cursor-pointer origin-center"
              style={{ animationDuration: '2s' }}
            />
            {/* Core dot - 50% smaller */}
            <circle 
              r={3 + (count * 0.1)} 
              fill={locationColor} 
              stroke="#ffffff"
              strokeWidth="1"
              className="peer cursor-pointer hover:fill-yellow-400 transition-colors block"
            />
            
            {/* City name below the dot */}
            <text 
              textAnchor="middle" 
              y={16 + (count * 0.15)} 
              fontSize={11} 
              fill="#ffffff" 
              fontWeight="600"
              className="pointer-events-none"
              style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {name}
            </text>
            
            <g className="opacity-0 peer-hover:opacity-100 transition-opacity duration-200 cursor-pointer pointer-events-none">
              <rect 
                x={8} 
                y={-14} 
                width={140} 
                height={40} 
                rx={6} 
                fill="#ffffff" 
                filter="url(#dropshadow)"
              />
              <text textAnchor="start" x={18} y={2} fontSize={12} fill="#1e293b" fontWeight="bold">
                {name}
              </text>
              <text textAnchor="start" x={18} y={16} fontSize={10} fill="#64748b" fontWeight="normal">
                {count} relative{count > 1 ? 's' : ''} here
              </text>
            </g>
          </Marker>
        )})}
      </ComposableMap>
      
      {/* Legend / Overlay info */}
      <div className="absolute bottom-8 left-8 bg-[#1e1e36]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl pointer-events-none">
        <h3 className="text-white font-bold mb-1">Family Diaspora</h3>
        <p className="text-slate-400 text-sm">Showing current locations</p>
      </div>
    </div>
  );
}
