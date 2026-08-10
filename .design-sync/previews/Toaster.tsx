import { useEffect } from "react";
import { Toaster, toast } from "tanstack_start_ts";

// `Toaster` is the sonner host — it renders nothing until a toast is fired, so
// each cell mounts the host and pushes real toasts on mount.
export const Toasts = () => {
  useEffect(() => {
    toast("Vokabel gespeichert");
    toast.success("Pool aktualisiert", { description: "12 neue Vokabeln hinzugefügt." });
    toast.error("Synchronisierung fehlgeschlagen", { description: "Später nochmal versuchen." });
  }, []);
  return (
    <div className="min-h-64">
      {/* `expand` shows the whole stack instead of collapsing to the newest. */}
      <Toaster position="top-center" expand />
    </div>
  );
};

export const WithAction = () => {
  useEffect(() => {
    toast("Vokabel aus dem Pool entfernt", {
      description: "rafiki — Freund, Freundin",
      action: { label: "Rückgängig", onClick: () => {} },
    });
  }, []);
  return (
    <div className="min-h-48">
      <Toaster position="top-center" />
    </div>
  );
};
