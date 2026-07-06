import { createFileRoute } from "@tanstack/react-router";
import { Reference } from "@/components/classes/Reference";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/classes")({
  head: () => ({
    meta: [
      { title: T.classes.metaTitle },
      { name: "description", content: T.classes.metaDescription },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <div className="px-5 pt-8">
      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">{T.classes.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.classes.title}</h1>
      </header>
      <Reference />
    </div>
  );
}
