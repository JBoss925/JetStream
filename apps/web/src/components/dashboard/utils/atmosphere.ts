export function pressureStatus(pressure?: number): string {
  if (!pressure) {
    return "Pressure unavailable";
  }

  if (pressure < 1000) {
    return "Low pressure";
  }

  if (pressure > 1022) {
    return "High pressure";
  }

  return "Steady pressure";
}
