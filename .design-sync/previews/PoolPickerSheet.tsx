import { PoolPickerSheet } from "tanstack_start_ts";

// Opens as a full-screen BottomSheet. The topic suggestions come from the app's
// backend, so a static card shows the initial search state.
//
// The `translateZ(0)` wrapper gives the sheet's `fixed inset-0` root a real
// containing block — see BottomSheet.tsx for why the card harness needs it.
export const Open = () => (
  <div className="relative h-[620px] w-full overflow-hidden" style={{ transform: "translateZ(0)" }}>
    <PoolPickerSheet open onClose={() => {}} onSaved={() => {}} />
  </div>
);
