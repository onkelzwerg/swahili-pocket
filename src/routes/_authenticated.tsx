import { createFileRoute, Outlet } from "@tanstack/react-router";

// Ehemals Auth-Guard — die App ist jetzt rein lokal, alle Routen sind frei.
// Der Dateiname bleibt, damit die Routen-Pfade (pathless layout) stabil bleiben.
export const Route = createFileRoute("/_authenticated")({
  component: Outlet,
});
