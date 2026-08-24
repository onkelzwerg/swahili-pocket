import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Beim Antippen/Überfahren schon laden. Zusammen mit dem Vorwärmen im
    // Leerlauf (lib/route-warmup.ts) verhindert das den Fall, in dem ein Tipp
    // ins Leere läuft, weil das Bündel der Zielroute noch nirgends liegt.
    defaultPreload: "intent",
  });

  return router;
};
