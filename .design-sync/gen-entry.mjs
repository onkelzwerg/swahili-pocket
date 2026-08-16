// Generates the design-system entry barrel + the componentSrcMap exclusions.
//
// This repo is a Vite APP, not a published component library: there is no
// dist entry and no shipped .d.ts tree. The converter needs both, so we give
// it two committed inputs it can chew on:
//
//   .design-sync/ds-entry.ts  — bundle entry: re-exports every component
//                               module, so window.<GLOBAL> carries the real
//                               shipped code (subparts included).
//   index.d.ts (package root) — types entry: `export * from` the barrel, which
//                               makes package-build's PKG_DIR resolve to the
//                               repo root and lets ts-morph read props straight
//                               off the .tsx sources.
//
// shadcn/ui exports subparts FLAT (TableRow, not Table.Row), so the converter's
// compound detection can't fold them under a parent — every subpart would
// otherwise get its own preview card. ROOTS below is the card surface; every
// other PascalCase export is excluded via componentSrcMap: null. All of them
// stay in the bundle and remain importable.
//
// Run:  node .design-sync/gen-entry.mjs
// Writes ds-entry.ts, index.d.ts, and .design-sync/.cache/src-map.json.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';

const PKG_DIR = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const COMPONENTS = join(PKG_DIR, 'src/components');

// The primary export of each module — the component that gets a preview card.
const ROOTS = {
  'ui/accordion.tsx': 'Accordion',
  'ui/alert-dialog.tsx': 'AlertDialog',
  'ui/alert.tsx': 'Alert',
  'ui/aspect-ratio.tsx': 'AspectRatio',
  'ui/avatar.tsx': 'Avatar',
  'ui/badge.tsx': 'Badge',
  'ui/breadcrumb.tsx': 'Breadcrumb',
  'ui/button.tsx': 'Button',
  'ui/calendar.tsx': 'Calendar',
  'ui/card.tsx': 'Card',
  'ui/carousel.tsx': 'Carousel',
  'ui/chart.tsx': 'ChartContainer',
  'ui/checkbox.tsx': 'Checkbox',
  'ui/collapsible.tsx': 'Collapsible',
  'ui/command.tsx': 'Command',
  'ui/context-menu.tsx': 'ContextMenu',
  'ui/dialog.tsx': 'Dialog',
  'ui/drawer.tsx': 'Drawer',
  'ui/dropdown-menu.tsx': 'DropdownMenu',
  'ui/form.tsx': 'Form',
  'ui/hover-card.tsx': 'HoverCard',
  'ui/input-otp.tsx': 'InputOTP',
  'ui/input.tsx': 'Input',
  'ui/label.tsx': 'Label',
  'ui/menubar.tsx': 'Menubar',
  'ui/navigation-menu.tsx': 'NavigationMenu',
  'ui/pagination.tsx': 'Pagination',
  'ui/popover.tsx': 'Popover',
  'ui/progress.tsx': 'Progress',
  'ui/radio-group.tsx': 'RadioGroup',
  'ui/resizable.tsx': 'ResizablePanelGroup',
  'ui/scroll-area.tsx': 'ScrollArea',
  'ui/select.tsx': 'Select',
  'ui/separator.tsx': 'Separator',
  'ui/sheet.tsx': 'Sheet',
  'ui/sidebar.tsx': 'Sidebar',
  'ui/skeleton.tsx': 'Skeleton',
  'ui/slider.tsx': 'Slider',
  'ui/sonner.tsx': 'Toaster',
  'ui/switch.tsx': 'Switch',
  'ui/table.tsx': 'Table',
  'ui/tabs.tsx': 'Tabs',
  'ui/textarea.tsx': 'Textarea',
  'ui/toggle-group.tsx': 'ToggleGroup',
  'ui/toggle.tsx': 'Toggle',
  'ui/tooltip.tsx': 'Tooltip',
  'BottomSheet.tsx': 'BottomSheet',
  'PackPreviewSheet.tsx': 'PackPreviewSheet',
  'PoolPickerSheet.tsx': 'PoolPickerSheet',
  'SpeakButton.tsx': 'SpeakButton',
  'TabBar.tsx': 'TabBar',
  'VocabList.tsx': 'VocabListPage',
  'classes/Reference.tsx': 'Reference',
  'exercises/GradeButtons.tsx': 'GradeButtons',
  'lexicon/CardsTab.tsx': 'CardsTab',
  'lexicon/PoolTab.tsx': 'PoolTab',
};

// Every .tsx under src/components, package-relative.
function componentFiles() {
  const out = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.tsx')) out.push(relative(COMPONENTS, p));
    }
  };
  walk(COMPONENTS);
  return out;
}

// PascalCase value exports of one module — `export { A, B }` blocks plus
// direct `export const/function/class`.
function exportsOf(rel) {
  const src = readFileSync(join(COMPONENTS, rel), 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (let t of m[1].split(',')) {
      t = t.trim().split(/\s+as\s+/).pop().trim();
      if (/^[A-Z][A-Za-z0-9]*$/.test(t)) names.add(t);
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9]*)/g)) names.add(m[1]);
  return [...names];
}

// ROOTS is the single source of truth for what the design system contains.
// A module that isn't listed is skipped entirely — not exported from the
// barrel, not given a card. That keeps a half-written component (one that
// doesn't compile yet, or imports something unresolvable) from breaking the
// whole sync; it just gets named in the warning below and picked up on a later
// run once someone adds it to ROOTS.
const discovered = componentFiles();
const files = discovered.filter((f) => f in ROOTS);
const unknown = discovered.filter((f) => !(f in ROOTS));
if (unknown.length) {
  console.error(
    `! ${unknown.length} component module(s) not in ROOTS — SKIPPED (add them to include): ${unknown.join(', ')}`,
  );
}

// ── ds-entry.ts (bundle entry) ───────────────────────────────────────────
const entry =
  `// GENERATED by .design-sync/gen-entry.mjs — do not edit by hand.\n` +
  `// Design-system barrel: every component module this repo ships.\n\n` +
  files.map((f) => `export * from "../src/components/${f.replace(/\.tsx$/, '')}";`).join('\n') +
  '\n\n' +
  `// sonner's imperative API. \`Toaster\` only renders toasts pushed through the\n` +
  `// same sonner instance, so it has to come out of this bundle too — a consumer\n` +
  `// importing "sonner" separately gets a second store and sees nothing. The app\n` +
  `// itself uses it this way (PoolPickerSheet, PoolTab, account, lib/pwa).\n` +
  `export { toast } from "sonner";\n\n` +
  `// Router + query context for preview cards. Must ship from this bundle so it\n` +
  `// shares module instances with the components — see preview-providers.tsx.\n` +
  `export { DsPreviewProviders } from "./preview-providers";\n`;
writeFileSync(join(PKG_DIR, '.design-sync/ds-entry.ts'), entry);

// ── index.d.ts (types entry) ─────────────────────────────────────────────
writeFileSync(
  join(PKG_DIR, 'index.d.ts'),
  `// GENERATED by .design-sync/gen-entry.mjs — types entry for /design-sync.\n` +
    `// Not part of the app build (tsconfig "include" does not cover it).\n` +
    `export * from "./.design-sync/ds-entry";\n`,
);

// ── componentSrcMap: pin roots to their source, exclude every subpart ────
const srcMap = {};
for (const f of files) {
  const root = ROOTS[f];
  for (const name of exportsOf(f)) {
    srcMap[name] = name === root ? `src/components/${f}` : null;
  }
}
// Sync scaffolding, not a design-system component — importable, but no card.
srcMap.DsPreviewProviders = null;

const roots = Object.entries(srcMap).filter(([, v]) => v !== null);
mkdirSync(join(PKG_DIR, '.design-sync/.cache'), { recursive: true });
writeFileSync(join(PKG_DIR, '.design-sync/.cache/src-map.json'), JSON.stringify(srcMap, null, 2) + '\n');

// ── stylesheet ───────────────────────────────────────────────────────────
// Tailwind v4 only emits the utilities it finds in the scanned sources. The
// app's own Vite build scans src/ only, so its stylesheet is missing anything
// the app happens not to use — including classes the previews (and designs
// built from this DS) rely on. Compile our own from ds-styles.src.css, which
// re-uses the app's tokens and base layer but also scans .design-sync/previews.
// Must re-run whenever a preview introduces a new utility class.
{
  const cli = join(PKG_DIR, '.ds-sync/node_modules/@tailwindcss/cli/dist/index.mjs');
  const out = join(PKG_DIR, 'dist/ds-styles.css');
  if (!existsSync(cli)) {
    console.error('! @tailwindcss/cli missing — run: (cd .ds-sync && npm i @tailwindcss/cli@4.3.0)');
  } else {
    mkdirSync(join(PKG_DIR, 'dist'), { recursive: true });
    const r = spawnSync(process.execPath, [cli, '-i', '.design-sync/ds-styles.src.css', '-o', out], {
      cwd: PKG_DIR,
      encoding: 'utf8',
    });
    if (r.status !== 0) console.error(`! tailwind compile failed:\n${r.stderr ?? ''}`);
    else console.log(`ds-styles.css: ${statSync(out).size} bytes (src/ + previews/)`);
  }
}

console.log(`ds-entry.ts: ${files.length} modules`);
console.log(`componentSrcMap: ${roots.length} roots, ${Object.keys(srcMap).length - roots.length} subparts excluded`);
console.log(`roots: ${roots.map(([k]) => k).join(', ')}`);
