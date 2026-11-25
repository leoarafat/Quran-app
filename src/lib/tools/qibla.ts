const KAABA = { lat: 21.4225, lng: 39.8262 };
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
export const normalize = (angle: number) => ((angle % 360) + 360) % 360;

/** Great-circle direction to the Kaaba, in degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number): number {
  const dLng = rad(KAABA.lng - lng);
  const y = Math.sin(dLng);
  const x = Math.cos(rad(lat)) * Math.tan(rad(KAABA.lat)) - Math.sin(rad(lat)) * Math.cos(dLng);
  return normalize(deg(Math.atan2(y, x)));
}

/** How far to turn: negative is left, positive is right, within -180..180. */
export function turnNeeded(heading: number, bearing: number): number {
  return normalize(bearing - heading + 180) - 180;
}

type Orientation = { alpha: number | null; absolute?: boolean; webkitCompassHeading?: number };

/**
 * Direction the top of the screen points, or null when the event cannot tell north.
 * iOS reports a compass heading; elsewhere only an "absolute" alpha is usable.
 */
export function headingFrom(event: Orientation, screenAngle: number): number | null {
  if (typeof event.webkitCompassHeading === "number" && Number.isFinite(event.webkitCompassHeading)) {
    return normalize(event.webkitCompassHeading + screenAngle);
  }
  if (event.absolute && typeof event.alpha === "number") return normalize(360 - event.alpha + screenAngle);
  return null;
}
