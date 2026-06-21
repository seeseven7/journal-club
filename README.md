# journal-club

A minimal journaling app with a PSX inspired interface.
You write directly on a teal CRT-style screen, and hold a key to bring up an 
equip-style menu for managing entries.

## How to use

- **Write** anywhere on the screen
- **Hold `Tab`** to open the menu
- **`↑` / `↓`** to move the highlight while holding `Tab`
- **Release `Tab`** to run the highlighted item:
  - **New Page** — saves the current page, then clears it
  - **Past Entries** — browse saved entries (`Esc` or click outside to close)
  - **Save** — store the current page
  - **Settings** — W.I.P.

Currently only local storage...

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

React + TypeScript + Vite.
