# journal-club

A minimal journaling app with a PSX inspired interface.
You write directly on a teal CRT-style screen, and hold a key to bring up an
equip-style menu for managing entries.

**Try it here: https://seeseven7.github.io/journal-club/**

Cigarettes icon is from Metal Gear 2.

## How to use

- **Title** your page on the top line; the creation date sits just below it
- **Write** in the body below
- **Hold `⌥` (right Option)** to open the menu
- **`↑` / `↓`** (or `←` / `→`) while holding to select from the options
- **Release `⌥`** to run the selected item (release without moving just cancels):
  - **New Page** — saves the current page, then clears it
  - **Past Entries** — browse saved entries by title + date (`Esc` or click
    outside to close)
  - **Save** — store the current page now
  - **Settings** — W.I.P.

Everything **autosaves** as you type. Entries live in your browser's local
storage (no account, no server).

## Project layout

```
src/
  App.tsx                 main screen + entry logic
  storage.ts              load/save entries to localStorage
  components/
    EquipMenu.tsx         the MGS-style hold-to-open menu
    EntryList.tsx         the Past Entries browser
  hooks/
    useEquipMenu.ts       keyboard handling (hold / cycle / release)
    useSound.ts           synthesized menu blips
```

## Built with

React + TypeScript + Vite + Love