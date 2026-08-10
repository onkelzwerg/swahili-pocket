# Swahili Pocket — how to build with this design system

A German-language Swahili vocabulary app. Warm, paper-like, mobile-first: cream
background, terracotta actions, a serif display face for headings.

## Setup

No provider is required. The components are styled entirely by CSS custom
properties defined on `:root` in the stylesheet — load `_ds/<folder>/styles.css`
and everything renders on-brand. Two exceptions worth knowing:

- **`Toaster`** must be mounted once near the root, and toasts must be pushed
  with the `toast` function from this package. Importing `toast` from `sonner`
  directly gives you a second instance whose toasts never appear.
- **`TooltipProvider`** must wrap any `Tooltip`. `SidebarProvider` must wrap
  `Sidebar`.

Dark mode is a class, not a media query: put `class="dark"` on a wrapper
(`@custom-variant dark (&:is(.dark *))`). Every colour token has a dark value.

## Styling idiom: Tailwind v4 utilities over semantic tokens

Style with Tailwind utility classes. Never hard-code a hex value — the palette
is the token set below, and each one is a real Tailwind colour, so it composes
into every colour utility (`bg-`, `text-`, `border-`, `ring-`, `fill-`) and
accepts opacity (`bg-ochre/20`, `bg-primary/90`).

| Token | Use it for |
|---|---|
| `background` / `foreground` | page surface and body text (cream / near-black) |
| `card` / `card-foreground` | raised surfaces — cards, sheets, list rows |
| `popover` / `popover-foreground` | menus, dropdowns, tooltips |
| `primary` / `primary-foreground` | terracotta — the main action colour |
| `secondary` / `secondary-foreground` | muted sand — secondary buttons, tags |
| `muted` / `muted-foreground` | de-emphasised backgrounds and helper text |
| `accent` / `accent-foreground` | hover/active surfaces |
| `destructive` / `destructive-foreground` | delete, errors, the "Nochmal" grade |
| `border`, `input`, `ring` | hairlines, field borders, focus rings |
| `ochre` / `ochre-foreground` | warm highlight — audio affordances, "Schwer" |
| `forest` / `forest-foreground` | success, mastery, "Gut" |
| `teal` / `teal-foreground` | "Einfach" — the easiest answer grade |
| `cream` | an extra warm neutral |

Radius comes from `--radius: 1rem`, so the scale is generous: `rounded-md` is
already ~14px. Use `rounded-md` on controls, `rounded-xl`/`rounded-2xl` on cards
and sheets, `rounded-full` on circular icon buttons.

Type: body text is Plus Jakarta Sans and needs no class. Headings use Fraunces —
`h1`/`h2`/`h3` get it automatically, and **`font-display`** applies it anywhere
else (use it on `CardTitle`, `DialogTitle`, `SheetTitle`, and on large vocabulary
words). `tabular-nums` for counters and intervals.

Only four project-specific classes exist beyond Tailwind — `flip-card`,
`flip-inner`, `flip-face`, `flip-back`, for the 3D card-flip in review. Don't
invent other bespoke class names; compose utilities instead.

## Where the truth lives

- `_ds/<folder>/styles.css` and its `@import`s — the token definitions (`:root`
  and `.dark`), the `@theme` mapping, and the base layer. Read it before styling.
- `components/<group>/<Name>/<Name>.prompt.md` — usage and worked examples per
  component. `<Name>.d.ts` — the exact props.
- Groups: `general` (the UI kit), plus `lexicon`, `classes` and `exercises`,
  which hold app-specific screens.

Sub-parts are **flat exports**, not namespaced: it's `CardHeader`, `TableRow`,
`SelectItem` — never `Card.Header`. They are all importable even though only the
root component has a preview card.

## Idiomatic example

```jsx
<Card className="max-w-sm">
  <CardHeader>
    <div className="flex items-start justify-between gap-3">
      <div>
        <CardTitle className="font-display text-2xl">rafiki</CardTitle>
        <CardDescription>Freund, Freundin</CardDescription>
      </div>
      <Badge variant="secondary">Ngeli 9/10</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Rafiki yangu anasoma Kiswahili.</p>
    <p className="mt-1 text-sm text-muted-foreground">Mein Freund lernt Swahili.</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline" className="flex-1">Kenne ich</Button>
    <Button className="flex-1">Nochmal</Button>
  </CardFooter>
</Card>
```

UI copy is **German**; the vocabulary being taught is Swahili. Keep both real —
`Speichern`, `Abbrechen`, `Üben starten`, `Msamiati`, `Ngeli`.
