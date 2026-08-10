// Context the app normally supplies at its root, packaged so preview cards can
// render components that depend on it.
//
// Why this lives in the bundle rather than in each preview: a preview that
// imported @tanstack/react-router itself would get a SECOND copy of the module,
// with its own React context — the Link inside the bundled TabBar would still
// see nothing. The provider has to come from the same bundle as the components,
// so it is exported from ds-entry.ts and wired up as cfg.provider.
//
// Excluded from the component surface via componentSrcMap (see gen-entry.mjs):
// it is sync scaffolding, not part of the design system.

import type { ReactNode } from "react";
import { MotionGlobalConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterContextProvider, createMemoryHistory, createRootRoute, createRouter } from "@tanstack/react-router";

// Components that enter with framer-motion (BottomSheet, PoolPickerSheet) start
// at opacity 0 / y 100%. A headless screenshot is taken before those animations
// run, so the card would come out blank. skipAnimations jumps every animation
// straight to its target, which is the state a preview should show anyway.
// Set here rather than in a preview so it applies to the framer-motion instance
// that is actually inside this bundle.
MotionGlobalConfig.skipAnimations = true;

// A bare root route is enough for <Link> to resolve and render an anchor.
const router = createRouter({
  routeTree: createRootRoute(),
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

// retry:false so a failed fetch settles immediately instead of holding a card
// in its loading state for the whole screenshot timeout.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export function DsPreviewProviders({ children }: { children?: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
  );
}
