export function lerp(start: number, end: number, percent: number) {
  return start * (1 - percent) + end * percent;
}

export function clamp(min: number, max: number, value: number) {
  return Math.min(Math.max(min, value), max);
}

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
