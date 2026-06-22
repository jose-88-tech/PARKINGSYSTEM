export type SpotSize = "small" | "medium" | "large";

export interface ParkingSpot {
  id: number;
  row: number;
  col: number;
  size: SpotSize;
  occupiedBy: string | null;
  occupiedAt: number | null;
}

export interface Vehicle {
  id: string;
  size: SpotSize;
  registeredAt: number;
}

// Priority: small vehicles prefer small spots; larger ones need larger or equal.
// Lower priority value = picked first.
const sizeRank: Record<SpotSize, number> = { small: 1, medium: 2, large: 3 };

export function canFit(vehicleSize: SpotSize, spotSize: SpotSize): boolean {
  return sizeRank[spotSize] >= sizeRank[vehicleSize];
}

/**
 * Priority Queue–style selection: among available spots that fit the vehicle,
 * pick the one with the smallest size (tightest fit) and lowest id.
 */
export function pickBestSpot(
  spots: ParkingSpot[],
  vehicleSize: SpotSize
): ParkingSpot | null {
  let best: ParkingSpot | null = null;
  for (const s of spots) {
    if (s.occupiedBy) continue;
    if (!canFit(vehicleSize, s.size)) continue;
    if (
      !best ||
      sizeRank[s.size] < sizeRank[best.size] ||
      (sizeRank[s.size] === sizeRank[best.size] && s.id < best.id)
    ) {
      best = s;
    }
  }
  return best;
}

export function buildLot(rows = 5, cols = 8): ParkingSpot[] {
  const spots: ParkingSpot[] = [];
  let id = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // distribute sizes: edges = large, middle row = small, rest medium
      let size: SpotSize = "medium";
      if (r === 0 || r === rows - 1) size = "large";
      else if (r === Math.floor(rows / 2)) size = "small";
      spots.push({ id: id++, row: r, col: c, size, occupiedBy: null, occupiedAt: null });
    }
  }
  return spots;
}
