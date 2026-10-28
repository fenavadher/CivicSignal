import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CitizenReport, ManagedIssue, CATEGORY_LABELS, IssueCategory } from '../../types';

interface CivicMapProps {
  reports?: CitizenReport[];
  managedIssues?: ManagedIssue[];
  selectedLocation?: { lat: number; lng: number } | null;
  onSelectLocation?: (location: { lat: number; lng: number }) => void;
  isPickerMode?: boolean;
  highlightRecurring?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (item: CitizenReport | ManagedIssue) => void;
}

const CATEGORY_COLORS: Record<IssueCategory, string> = {
  pothole_roads: '#DC2626', // Red
  water_infrastructure: '#0284C7', // Sky Blue
  garbage_accumulation: '#D97706', // Amber
  broken_streetlights: '#4F46E5', // Indigo
  damaged_sidewalks: '#7C3AED', // Purple
  drainage_problems: '#0D9488', // Teal
  other: '#64748B', // Slate
};

function createCustomPin(color: string, label: string) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #FFFFFF;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const PICKER_PIN = L.divIcon({
  className: 'picker-map-pin',
  html: `
    <div style="
      background-color: #2563EB;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(37,99,235,0.45);
      cursor: grab;
      animation: bounce 1s infinite alternate;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #FFFFFF;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export const CivicMap: React.FC<CivicMapProps> = ({
  reports = [],
  managedIssues = [],
  selectedLocation,
  onSelectLocation,
  isPickerMode = false,
  highlightRecurring = true,
  center = [47.6062, -122.3321], // Default civic district coordinates
  zoom = 14,
  height = '420px',
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : center;
    const map = L.map(mapContainerRef.current, {
      center: initialCenter as L.LatLngExpression,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Picker click handler
    if (isPickerMode && onSelectLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onSelectLocation({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. In Picker Mode: place or move single picker marker
    if (isPickerMode) {
      if (selectedLocation) {
        if (!pickerMarkerRef.current) {
          const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
            icon: PICKER_PIN,
            draggable: true,
          }).addTo(markersLayer);

          marker.on('dragend', (e) => {
            const latlng = (e.target as L.Marker).getLatLng();
            onSelectLocation?.({
              lat: Number(latlng.lat.toFixed(6)),
              lng: Number(latlng.lng.toFixed(6)),
            });
          });

          pickerMarkerRef.current = marker;
        } else {
          pickerMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
        }
      }
      return;
    }

    // 2. Display mode: Managed Issues
    managedIssues.forEach((issue) => {
      if (!issue.location?.lat || !issue.location?.lng) return;
      const color = CATEGORY_COLORS[issue.category] || '#2563EB';
      const icon = createCustomPin(color, issue.title);

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon });

      // Highlight recurring problems with a subtle circle buffer
      if (highlightRecurring && (issue.isRecurring || issue.recurrenceCount > 0)) {
        L.circle([issue.location.lat, issue.location.lng], {
          radius: 90,
          color: '#DC2626',
          fillColor: '#FEE2E2',
          fillOpacity: 0.35,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(markersLayer).bindTooltip(`⚠️ Recurring Incident Hotspot (${issue.recurrenceCount || 2} reports)`, {
          permanent: false,
          direction: 'top',
        });
      }

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; max-width: 240px;">
          <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">${issue.title}</div>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: #EFF6FF; color: #1D4ED8; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
              ${CATEGORY_LABELS[issue.category] || issue.category}
            </span>
            <span style="background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              Score: ${issue.priorityScore}/100
            </span>
          </div>
          <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">
            📍 ${issue.location.address || 'Civic Center'}
          </div>
          <div style="color: #0F172A; font-size: 11px; margin-bottom: 8px;">
            Status: <strong>${issue.status.replace(/_/g, ' ').toUpperCase()}</strong> • Linked Reports: ${issue.originalReportIds.length}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onMarkerClick?.(issue);
      });

      marker.addTo(markersLayer);
    });

    // 3. Display mode: Standalone Citizen Reports (if any not covered by managed issues)
    reports.forEach((rep) => {
      if (!rep.location?.lat || !rep.location?.lng) return;
      if (rep.managedIssueId && managedIssues.some((m) => m.id === rep.managedIssueId)) {
        return; // already represented by managed issue marker
      }

      const color = CATEGORY_COLORS[rep.category] || '#64748B';
      const icon = createCustomPin(color, rep.title);
      const marker = L.marker([rep.location.lat, rep.location.lng], { icon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; max-width: 240px;">
          <div style="font-weight: 600; color: #1E293B; margin-bottom: 4px;">${rep.title}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
            ${CATEGORY_LABELS[rep.category]} • ${rep.severity.toUpperCase()} Severity
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            📍 ${rep.location.address}
          </div>
          <div style="font-size: 11px; color: #2563EB;">
            Status: ${rep.status.replace(/_/g, ' ')}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onMarkerClick?.(rep);
      });
      marker.addTo(markersLayer);
    });
  }, [reports, managedIssues, selectedLocation, isPickerMode, highlightRecurring]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {isPickerMode && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-700 pointer-events-none">
          Click anywhere on the map or drag the blue pin to set incident coordinates.
        </div>
      )}

      {/* Legend */}
      {!isPickerMode && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs text-[11px] text-slate-600 flex flex-wrap gap-2.5 items-center">
          <span className="font-semibold text-slate-800">Key:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Roads & Potholes
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Water & Pipes
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Sanitation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Streetlights
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-red-100"></span> Recurring Hotspot
          </span>
        </div>
      )}
    </div>
  );
};
