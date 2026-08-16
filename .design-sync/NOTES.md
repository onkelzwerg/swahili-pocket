# design-sync notes — swahili-pocket

Repo-specific gotchas for future `/design-sync` runs. Read this before anything else.

## Shape: this repo is an app, not a component library

There is no published entry and no shipped `.d.ts` tree, so three committed
inputs stand in for them. All are produced or used by
`node .design-sync/gen-entry.mjs` (that's `cfg.buildCmd` — run it before the
converter, every time):

- `.design-sync/ds-entry.ts` — the bundle entry (`--entry`). Re-exports every
  component module listed in `ROOTS`, plus `toast` and `DsPreviewProviders`.
- `index.d.ts` at the package root — the **types** entry. Its only job is to make
  `package-build.mjs` resolve `PKG_DIR` to the repo root and let ts-morph read
  props straight off the `.tsx` sources. Without it, every emitted
  `<Name>.d.ts` comes out with an empty props body.
- `.design-sync/preview-providers.tsx` — router/query context + the
  framer-motion switch (see below).

`--entry` must stay `./.design-sync/ds-entry.ts`: `PKG_DIR` is derived by walking
up from the entry to the nearest `package.json` with a `name`, and that has to
land on the repo root or `isOwnProp` filters out every prop.

## ROOTS is the gate

`gen-entry.mjs`'s `ROOTS` table maps each component module to its primary export.
**A module not in ROOTS is skipped entirely** — not bundled, not carded. That is
deliberate: it keeps a half-written component from breaking the whole sync. The
script prints a `!` line naming every skipped module; check that line on every
run and add the ones that are ready.

Skipped at the time of the first sync (2026-08-09, both brand new and mid-edit):
`WeekGoal.tsx`, `settings/LearningMethodSection.tsx`. The latter imports
`@/lib/srs` (a directory) which esbuild cannot resolve through the tsconfig
paths mapping — it needs an explicit `@/lib/srs/index` or a real file path
before it can be included.

`componentSrcMap` is a generated enumeration on purpose: shadcn/ui exports
subparts **flat** (`TableRow`, not `Table.Row`), so the converter's compound
detection can't fold them under a parent and all ~250 exports would each get
their own card. `gen-entry.mjs` pins the 55 roots and sets the ~195 subparts to
`null`. Subparts stay in the bundle and stay importable — they just have no card.

## The one rule that explains most breakage: shared module instances

A preview that imports a library directly gets a **second copy** of that module,
with its own React context and its own globals — so it cannot talk to the
components inside `_ds_bundle.js`. Anything context-shaped therefore has to be
re-exported from `ds-entry.ts` and used from `"tanstack_start_ts"`:

- `toast` — a `Toaster` from the bundle only shows toasts pushed through the
  bundle's own sonner instance. Symptom: toasts silently never appear.
- `@tanstack/react-router`, `@tanstack/react-query` — wired through
  `DsPreviewProviders` (`cfg.provider`). Without it, `TabBar` and
  `VocabListPage` die with `Cannot read properties of null (reading 'stores')`.
- `framer-motion`'s `MotionGlobalConfig.skipAnimations = true`, set inside
  `preview-providers.tsx`. Headless screenshots are taken before enter
  animations run, so `BottomSheet` / `PoolPickerSheet` would capture at
  `opacity: 0`. Symptom: a completely blank card for a component that works fine
  in the app.

`DsPreviewProviders` is sync scaffolding, not a design-system component;
`gen-entry.mjs` excludes it from the card surface via `componentSrcMap`.

## `position: fixed` inside a preview card

The card harness wraps each cell in a `.ds-single` div that carries a
`transform`, which makes it the containing block for `position: fixed` — and it
is 0-height. Full-screen overlays anchored with `fixed inset-0` (`BottomSheet`,
`PoolPickerSheet`) therefore collapse. The fix is in the preview: wrap the
component in a div with an explicit height **and** `transform: translateZ(0)`,
so that div becomes the containing block. Radix overlays (Dialog, Sheet, Drawer,
…) portal to `document.body` and are unaffected.

## Build-order rules (these cost real debugging time)

1. **`gen-entry.mjs` before every capture.** Tailwind v4 only emits utilities it
   finds in the scanned sources, and the app's own Vite build scans `src/` only.
   `.design-sync/ds-styles.src.css` re-uses the app's tokens and base layer and
   adds `@source "./previews"`; `gen-entry.mjs` compiles it to
   `dist/ds-styles.css` (`cfg.cssEntry`). A preview using a class the app never
   used (`max-w-sm`, `gap-6`, `h-[620px]`) renders **silently unstyled**
   otherwise — no warning, no failed check.
2. **`preview-rebuild.mjs` does NOT refresh `_ds_bundle.css`.** It only rebuilds
   preview JS. If a preview introduces a new utility class, you need a full
   `package-build.mjs` or the class is missing from the bundle the card loads.
3. **A full `package-build.mjs` wipes `ds-bundle/_screenshots/`.** Always
   capture *after* the build, never before.
4. `@tailwindcss/cli` lives in `.ds-sync/`. Pin **4.3.3 or newer** — 4.3.0 has a
   package-layout bug that fails to resolve `@tailwindcss/node` under Node 26.
   The repo itself is on tailwindcss 4.3.0; the patch drift is cosmetic.

## Preview authoring

- **Exports must be function components** — `export const Basic = () => (<X/>)`.
  A bare JSX element export produces `[CAPTURE] … evaluated to no exports
  (window.__dsCells is empty)`; the harness only collects exports where
  `typeof === 'function'`.
- Import components from `"tanstack_start_ts"`. `lucide-react`, `react-hook-form`
  and `@/…` aliases resolve normally (no shared context needed).
- `react-hook-form`: never call `setError` during render — it loops and the cell
  comes out blank. Use `useEffect`.
- Content convention: the app's UI language is **German** with Swahili
  vocabulary (see `src/config/translations.ts`). Previews follow that — it's what
  the design agent should imitate.
- A component that fetches its own content shows its empty state in the harness
  (`PoolTab`). Where that state is the whole point of the card — `PackPreviewSheet`
  is a word list and nothing else — the preview installs a `fetch` stub for its
  one path at module scope and delegates every other URL to the real `fetch`.
  Patching globally without that delegation would break the other cells.

## Component defects found while building previews

Real bugs in the repo, not preview problems. Each one is why a cell is missing:

- **`resizable.tsx` is written for an older react-resizable-panels.** It styles
  the vertical axis with `data-[panel-group-direction=vertical]:flex-col`, but
  v4.6 renders `data-group` plus a plain `direction` attribute. The rule never
  matches, so **a vertical `ResizablePanelGroup` lays out as a row**. The
  `Vertical` cell is omitted until this is fixed.
- **`--sidebar-*` tokens were never defined.** `src/components/ui/sidebar.tsx`
  exists but `src/styles.css` has no `--sidebar` family, so `Sidebar` falls back
  to the page background instead of its own tone. Invisible in production
  because the app never imports Sidebar.
- **No visual disabled state** on `Slider` (`disabled:opacity-50` sits on the
  Thumb, and `disabled:` never matches a div) or on `GradeButtons`
  (`disabled:pointer-events-none` only). Disabled cells are omitted rather than
  shipping two identical-looking variants.
- **`DropdownMenuItem` / `ContextMenuItem` have no `variant` prop** in this
  version. A destructive item is styled with `className="text-destructive"`.
- **`ContextMenu` cannot render open statically** — Radix's `ContextMenu.Root`
  has no `defaultOpen`, it only opens from a real contextmenu event. The card
  shows the trigger surface; the full menu composition is in the preview source
  and in the prompt example.

## Known render warns

Expected on every run — a warn *not* in this list is new and worth looking at.

- `[TOKENS_MISSING] --radix-navigation-menu-viewport-width/-height` — set at
  runtime by Radix inline styles. Not a defect.
- `[TOKENS_MISSING] --sidebar-border, --sidebar-accent` — the real gap described
  above.

## Fonts

Fraunces + Plus Jakarta Sans are loaded from Google Fonts at runtime by
`src/routes/__root.tsx`, so nothing ships them. They are vendored as woff2 under
`.design-sync/fonts/` (7 `@font-face` rules, ~220 KB) and wired via
`cfg.extraFonts`. Both are SIL OFL 1.1, so redistribution is fine.
Regenerate by re-fetching `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900`
and `…?family=Plus+Jakarta+Sans:wght@200..800` with a desktop-Chrome UA, then
rewriting the `url()`s to local filenames.

## Re-sync risks

- **`ROOTS` is hand-maintained.** New components under `src/components` are
  skipped until added. The repo was under active development during the first
  sync — three components appeared mid-run — so expect this list to be stale.
- **Preview compositions are hand-written against the current props.** A renamed
  cva variant or a changed prop will not fail the build; it surfaces only as a
  card that renders wrong. Re-grade after any shadcn/ui or Radix upgrade.
- **The `.ds-single` transform and the framer-motion switch are harness
  assumptions.** If the card harness stops applying a transform, the
  `translateZ(0)` wrappers become unnecessary (harmless, but the comment will be
  wrong). If a component starts animating on mount and shows blank, check that
  `skipAnimations` is still honoured by the installed framer-motion.
- **The vendored fonts are a point-in-time copy** of Google's files. They do not
  update with upstream.
- **`dist/` is gitignored**, so `dist/ds-styles.css` (`cfg.cssEntry`) does not
  survive a fresh clone — `gen-entry.mjs` regenerates it. `.ds-sync/` also has to
  be re-staged and its deps reinstalled on a fresh clone.
- **The stylesheet only contains utilities used by `src/` + `previews/`.** A
  design built in Claude Design that reaches for a utility neither uses will not
  find a rule for it. If that becomes a problem, widen `@source` in
  `.design-sync/ds-styles.src.css` or add `@source inline(...)` for a safelist.
