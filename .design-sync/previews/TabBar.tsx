import { TabBar } from "tanstack_start_ts";

// TabBar is `fixed` to the bottom of the viewport and uses TanStack Router
// links — the router context comes from cfg.provider (DsPreviewProviders).
export const Bar = () => (
  <div className="relative h-40">
    <TabBar />
  </div>
);
