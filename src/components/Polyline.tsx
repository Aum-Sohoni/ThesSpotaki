import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface PolylineProps {
  path: google.maps.LatLngLiteral[];
  strokeColor: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  strokeStyle?: 'solid' | 'dashed';
}

export function Polyline({
  path,
  strokeColor,
  strokeOpacity = 1.0,
  strokeWeight = 4,
  strokeStyle = 'solid',
}: PolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Standard dashed pattern styling
    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 2.5,
    };

    const options: google.maps.PolylineOptions = {
      path,
      strokeColor,
      strokeOpacity: strokeStyle === 'dashed' ? 0 : strokeOpacity,
      strokeWeight,
      icons: strokeStyle === 'dashed' ? [{
        icon: lineSymbol,
        offset: '0',
        repeat: '12px'
      }] : undefined,
    };

    const polyline = new google.maps.Polyline(options);
    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor, strokeOpacity, strokeWeight, strokeStyle]);

  return null;
}
