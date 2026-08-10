import { Switch, Label } from "tanstack_start_ts";

export const States = () => (
  <div className="grid gap-4">
    <div className="flex items-center gap-3">
      <Switch id="s1" defaultChecked />
      <Label htmlFor="s1">Tägliche Erinnerung</Label>
    </div>
    <div className="flex items-center gap-3">
      <Switch id="s2" />
      <Label htmlFor="s2">Offline-Audio vorladen</Label>
    </div>
    <div className="flex items-center gap-3">
      <Switch id="s3" disabled defaultChecked />
      <Label htmlFor="s3" className="opacity-50">
        Synchronisierung (durch Konto festgelegt)
      </Label>
    </div>
  </div>
);

export const SettingsRow = () => (
  <div className="w-full max-w-sm divide-y divide-border rounded-xl border border-border bg-card">
    {[
      ["Aussprache automatisch", true],
      ["Beispielsätze zeigen", true],
      ["Dunkles Design", false],
    ].map(([label, on]) => (
      <div key={label as string} className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">{label as string}</span>
        <Switch defaultChecked={on as boolean} />
      </div>
    ))}
  </div>
);
