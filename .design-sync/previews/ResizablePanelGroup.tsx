import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "tanstack_start_ts";

// react-resizable-panels puts `height: 100%` inline on the group, and an inline
// style beats a utility class — so the height has to come from a sized wrapper,
// not from a className on ResizablePanelGroup itself.
export const Horizontal = () => (
  <div className="h-56 w-full max-w-md">
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-xl border border-border bg-card"
    >
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full flex-col gap-2 p-4">
          <h4 className="font-display text-sm font-semibold">Pools</h4>
          {["Begrüßungen", "Zahlen 1–20", "Reisen"].map((t) => (
            <span key={t} className="text-sm text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <div className="flex h-full flex-col justify-center p-4">
          <span className="font-display text-2xl">rafiki</span>
          <span className="text-sm text-muted-foreground">Freund, Freundin</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

// No Vertical cell. `resizable.tsx` styles the vertical axis with
// `data-[panel-group-direction=vertical]:flex-col`, but react-resizable-panels
// 4.6 renders `data-group` + a plain `direction` attribute instead of
// `data-panel-group-direction` — so that rule never matches and a vertical
// group lays out as a row. This is a real defect in the component, not in the
// preview; see NOTES.md. Re-add this cell once resizable.tsx is fixed.
