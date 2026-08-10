import { PoolTab } from "tanstack_start_ts";

// PoolTab fetches the shared pool through react-query; the QueryClient comes
// from cfg.provider (DsPreviewProviders). Without a backend the query settles
// empty, so the card shows the tab's loaded-but-empty state.
export const Pool = () => <PoolTab />;
