# Docs screenshots

`run.mjs` takes the screenshots in `images/` from the live app with Playwright, and `--apply` swaps each `{/* Screenshot: … */}` placeholder in the docs for its image.

## Setup

- A demo account with email and password sign-in, an **Admin** in the workspace the docs are shot in (default: `The Drive AI`; set `THEDRIVE_WORKSPACE` to change it).
- Its credentials in `~/.thedrive-docs-demo.env`, readable only by you:

  ```bash
  THEDRIVE_DEMO_EMAIL=you+docs@example.com
  THEDRIVE_DEMO_PASSWORD=...
  ```

- Playwright 1.60 or later. Point `PLAYWRIGHT` at its `index.mjs` if it isn't installed here, for example `PLAYWRIGHT=../thedrive_backend/node_modules/playwright/index.mjs`.

The signed-in session is kept in `~/.cache/thedrive-docs/state.json`. Add `--login` to sign in again.

## Commands

```bash
node scripts/screenshots/run.mjs --list            # every shot, whether its image exists, and why manual ones aren't scripted
node scripts/screenshots/run.mjs                   # take every scripted shot
node scripts/screenshots/run.mjs canvas trash      # take some
node scripts/screenshots/run.mjs --apply           # replace placeholders that now have an image
```

A failed shot leaves a screenshot of where it stopped in `~/.cache/thedrive-docs/<id>.failed.png`.

## What the shots expect in the workspace

- A **Docs Demo** folder at the top level holding the files in `sample/`.
- Agent conversations in that folder, started by these prompts:
  - "Move sales-2025.csv in this folder to the trash" — left unapplied, so its change card says **Needs your OK**. Don't click **Apply**.
  - "Chart the monthly revenue in sales-2025.csv"
  - "Summarise Master-Services-Agreement-Contoso.pdf in a one-page PDF"
  - "Draft a workflow that runs every weekday at 9:00 AM on Docs Demo, checks each file, and saves a copy of the PDFs to Google Drive. Don't save it yet."
- A personal agent memory note, for the memory shot.

Nothing a shot does is saved: dialogs are closed, the e-sign draft and the workflow draft are left unsaved, and nothing is sent or published.

Shots marked manual need a state a script can't set up (the phone app, the extension, owner-only screens, an account the demo user connected itself, or a request that emails real people). Take those by hand at 1440×900, save them under the file name `--list` shows, and run `--apply`.
