import { createFileRoute } from "@tanstack/react-router";
import { ParkingDashboard } from "@/components/ParkingDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parking Allocation Dashboard" },
      {
        name: "description",
        content:
          "Real-time parking allocation dashboard using a priority queue and hash map for fast spot assignment.",
      },
      { property: "og:title", content: "Parking Allocation Dashboard" },
      {
        property: "og:description",
        content:
          "Visualize, allocate and release parking spots in real time with priority-based assignment.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ParkingDashboard />;
}
