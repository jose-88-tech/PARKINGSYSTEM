import { useMemo, useState } from "react";
import { Car, CircleParking, LogOut, Plus, Activity } from "lucide-react";
import {
  buildLot,
  pickBestSpot,
  type ParkingSpot,
  type SpotSize,
  type Vehicle,
} from "@/lib/parking";

const ROWS = 5;
const COLS = 8;

export function ParkingDashboard() {
  const [spots, setSpots] = useState<ParkingSpot[]>(() => buildLot(ROWS, COLS));
  // Hash map for O(1) lookup: vehicleId -> spotId
  const [vehicleMap, setVehicleMap] = useState<Record<string, number>>({});
  // Queue of registered, not-yet-parked vehicles
  const [queue, setQueue] = useState<Vehicle[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [vehicleSize, setVehicleSize] = useState<SpotSize>("medium");
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const occupied = spots.filter((s) => s.occupiedBy).length;
    return { total: spots.length, occupied, available: spots.length - occupied };
  }, [spots]);

  const addLog = (msg: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 8));

  function registerVehicle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const id = vehicleId.trim();
    if (!id) return setError("Vehicle ID is required.");
    if (id.length > 16) return setError("Vehicle ID must be 16 characters or fewer.");
    if (vehicleMap[id] || queue.some((v) => v.id === id))
      return setError("Vehicle is already registered.");

    setQueue((q) => [...q, { id, size: vehicleSize, registeredAt: Date.now() }]);
    addLog(`Registered ${id} (${vehicleSize})`);
    setVehicleId("");
  }

  function processEntry() {
    setError(null);
    if (queue.length === 0) return setError("No vehicles in registration queue.");

    const next = queue[0];
    const spot = pickBestSpot(spots, next.size);
    if (!spot) {
      setError(`No available spot fits ${next.id} (${next.size}).`);
      return;
    }

    setSpots((prev) =>
      prev.map((s) =>
        s.id === spot.id ? { ...s, occupiedBy: next.id, occupiedAt: Date.now() } : s
      )
    );
    setVehicleMap((m) => ({ ...m, [next.id]: spot.id }));
    setQueue((q) => q.slice(1));
    addLog(`Parked ${next.id} at spot #${spot.id} (${spot.size})`);
  }

  function releaseSpot(spot: ParkingSpot) {
    if (!spot.occupiedBy) return;
    const vid = spot.occupiedBy;
    setSpots((prev) =>
      prev.map((s) =>
        s.id === spot.id ? { ...s, occupiedBy: null, occupiedAt: null } : s
      )
    );
    setVehicleMap((m) => {
      const { [vid]: _, ...rest } = m;
      return rest;
    });
    addLog(`Released ${vid} from spot #${spot.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CircleParking className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Parking Allocation System</h1>
              <p className="text-xs text-muted-foreground">
                Priority queue + hash map allocation dashboard
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Activity className="h-3.5 w-3.5" /> Live
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <StatGrid stats={stats} queued={queue.length} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Lot Layout</h2>
                <p className="text-xs text-muted-foreground">
                  Click an occupied spot to release the vehicle.
                </p>
              </div>
              <Legend />
            </div>

            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {spots.map((s) => (
                <SpotCell key={s.id} spot={s} onClick={() => releaseSpot(s)} />
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Register Vehicle</h2>
            <form onSubmit={registerVehicle} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Vehicle ID
                </label>
                <input
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  placeholder="e.g. ABC-123"
                  maxLength={16}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as SpotSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setVehicleSize(sz)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize transition ${
                        vehicleSize === sz
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent"
              >
                <Plus className="h-4 w-4" /> Add to Queue
              </button>
              <button
                type="button"
                onClick={processEntry}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Car className="h-4 w-4" /> Process Entry
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Queue ({queue.length})</h2>
            {queue.length === 0 ? (
              <p className="text-xs text-muted-foreground">No vehicles waiting.</p>
            ) : (
              <ul className="space-y-1.5">
                {queue.map((v, i) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-md bg-muted px-2 py-1.5 text-xs"
                  >
                    <span className="font-mono">
                      {i + 1}. {v.id}
                    </span>
                    <span className="capitalize text-muted-foreground">{v.size}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Activity Log</h2>
            {log.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {log.map((line, i) => (
                  <li key={i} className="truncate font-mono">{line}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function SpotCell({ spot, onClick }: { spot: ParkingSpot; onClick: () => void }) {
  const occupied = !!spot.occupiedBy;
  return (
    <button
      onClick={onClick}
      disabled={!occupied}
      title={
        occupied
          ? `Spot #${spot.id} — ${spot.occupiedBy} (click to release)`
          : `Spot #${spot.id} — available (${spot.size})`
      }
      className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg border text-[10px] font-medium transition ${
        occupied
          ? "border-occupied/30 bg-occupied text-occupied-foreground hover:opacity-90 cursor-pointer"
          : "border-available/30 bg-available text-available-foreground cursor-default"
      }`}
    >
      <span className="absolute left-1 top-1 text-[9px] opacity-70">#{spot.id}</span>
      <span className="absolute right-1 top-1 text-[9px] uppercase opacity-60">
        {spot.size[0]}
      </span>
      {occupied ? (
        <>
          <Car className="h-4 w-4" />
          <span className="mt-0.5 max-w-full truncate px-1 font-mono">
            {spot.occupiedBy}
          </span>
          <LogOut className="absolute bottom-1 right-1 h-3 w-3 opacity-0 transition group-hover:opacity-80" />
        </>
      ) : (
        <span className="opacity-70">Free</span>
      )}
    </button>
  );
}

function StatGrid({
  stats,
  queued,
}: {
  stats: { total: number; occupied: number; available: number };
  queued: number;
}) {
  const occupancy = stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total Spots" value={stats.total} />
      <StatCard label="Available" value={stats.available} tone="available" />
      <StatCard label="Occupied" value={stats.occupied} tone="occupied" />
      <StatCard label="Occupancy" value={`${occupancy}%`} hint={`${queued} queued`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone?: "available" | "occupied";
  hint?: string;
}) {
  const toneClass =
    tone === "available"
      ? "text-available-foreground"
      : tone === "occupied"
        ? "text-occupied"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-available" /> Available
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-occupied" /> Occupied
      </span>
    </div>
  );
}
