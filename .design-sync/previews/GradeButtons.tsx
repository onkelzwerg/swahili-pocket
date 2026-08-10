import { GradeButtons } from "tanstack_start_ts";

// The four answer grades map to the brand's semantic colours:
// 1 destructive, 2 ochre, 3 forest, 4 teal. `preview` is the interval
// forecast rendered under each label; `null` is the loading state.
export const Grades = () => (
  <div className="w-full max-w-sm">
    <GradeButtons preview={["<1 Min", "10 Min", "2 Tage", "6 Tage"]} onGrade={() => {}} />
  </div>
);

export const LoadingPreview = () => (
  <div className="w-full max-w-sm">
    <GradeButtons preview={null} onGrade={() => {}} />
  </div>
);

// No Disabled cell: the component's disabled styling is only
// `disabled:pointer-events-none`, so it is pixel-identical to the enabled state.

// `visible={false}` animates the row to opacity 0 — nothing to show in a card,
// so it has no cell either.
