# Writing for answer engines

How docs.thedrive.ai should be written so ChatGPT, Claude, Perplexity and Gemini can find it, trust it and quote it. CLAUDE.md still governs everything else: accuracy, voice, components and git. Read both before you write.

## Why the docs matter for this

On 2026-11-12 we captured the searches ChatGPT (gpt-5.6-luna, the model free ChatGPT runs) makes before it answers questions in our category. It searches in two steps:

1. **Discovery.** One broad search finds the candidate brands, for example `best AI file management software for small business 2026 AI document management official`.
2. **Verification.** Then it searches each candidate's own site, for example `site:dropbox.com plans business Dash AI pricing official` or `site:zushapp.com AI file organizer official preview undo local AI`.

Nearly every search ends in "official". In that week's measurement:

- **What ChatGPT cited:** official help and docs pages 521 times, vendor product pages 515, blogs 43, listicles 38.
- **What it cited of ours:** the main site 31 times, docs.thedrive.ai never.

`site:thedrive.ai` matches this subdomain too, so these docs are the official record ChatGPT looks for when it checks us. The job here is to pass that check. Getting into the candidate list in the first place happens off this site (reviews, listicles, community).

The in-app agent also reads these docs (the backend's agent:sync-docs snapshots them), so a page that helps an answer engine must stay exact enough for the agent.

## The two kinds of page

**Reference pages** are everything that exists today: the product manual, organized by feature (Approving and Undoing, Connected Drives, Steps). Keep writing them exactly as before.

**Guides** live in `guides/`. Each one answers one question a buyer or an answer engine actually asks, in their words, and links to the reference pages for the detail. A guide doesn't repeat the reference pages. It states the answer, the plan, the steps in brief and the limits, then points to the reference page that holds the detail.

### When to write a guide

Write one only when all of these are true:

- The question shows up in real data: an answer engine's own search, an AEO prompt we track (`frontend.thedrive.ai/scripts/aeo/prompts.ts`), a GSC or Bing query, or a support question.
- The answer is something The Drive AI does today. Check it against the reference pages, and against the backend or frontend code when the pages don't settle it.
- No existing guide owns the question. One question gets one URL.

### Who owns which question

| Question shape | Owner |
| --- | --- |
| "Can The Drive AI do X?" / "How do I do X with AI?" (our product) | a guide here |
| Every button, setting, state and limit of a feature | a reference page here |
| "How do I do X in Google Drive?" (the general how-to, any tool) | a blog post on thedrive.ai |
| "Is The Drive AI right for a law firm / accountant / ..." | a solutions page on thedrive.ai |
| "The Drive AI vs Gemini / Copilot / Zush / Dropbox Dash" | a comparison page on thedrive.ai |

**Don't compete with the main site.** On 2026-11-12, every guide topic already had a thedrive.ai page ranking in positions 3 to 15 on Google (for example /integrations/google-drive, /ai-file-organizer, /blog/clean-up-shared-office-nas), while docs pages sat at 25 to 75 with no clicks. A guide that chases the same generic phrase splits the signal between two of our own pages. So a guide names the product in its title (the generic searches stay with the main site, and an answer engine's `site:thedrive.ai` check still finds it), and its last Related card links to the main-site page that owns the topic. Check `npm run search-data` in the frontend repo (`gsc/gsc_page_query_3M.csv`) for the owner before you write.

Don't write vendor comparisons here. The docs describe our product. A guide can link to a comparison page with a full URL, since it's another site.

## The shape of a guide

1. **Title**: the task in the reader's words, ending in the product: "Organize Google Drive with The Drive AI", not "Connected Drives", and not the bare "Organize Google Drive with AI". The bare phrase belongs to the main site's page, which already ranks for it (see below).
2. **Description**: one sentence that answers the title and names The Drive AI. Keep it under 160 characters so it fits a search result.
3. **First paragraph: the answer.** Two or three sentences that stand on their own if quoted with nothing around them. Name The Drive AI, say what it does, and give the plans that include it. No preamble.
4. **What you need**: the plans that include it (plan names only), the accounts to connect, and who in a workspace can do it.
5. **How it works**: the shortest path that works, as `<Steps>` or a short list, with links to the reference pages.
6. **What it can't do**: the real limits, stated plainly. These are what make the rest believable. Never drop them to make a page read better.
7. **Related**: two to four links to the reference pages and the other guides.

### Words to use

Use the phrases answer engines search with, where they're accurate:

- "organize files by content, not filename"
- "preview, approve and undo" (Zush owns "preview undo" today)
- "organize Google Drive / SharePoint / OneDrive / Dropbox with AI"
- "clean up thousands of existing files"
- "file email attachments automatically by vendor and year"

Say "approve file changes before they happen", not "approval workflow". ChatGPT reads "approval workflow" as contract software and goes to Ironclad, Juro and Conga.

### Rules

- **Plan names, never prices.** Prices change, and `snippets/generated/plans.mdx` is the only place they live. Link to [Plans & Pricing](/account/plans-pricing).
- **Only claims the reference pages or the code back.** If a guide needs a fact that no reference page states, add it to the reference page first, then link to it.
- **Check every "can't" against the backend.** Reference pages fall behind the product. In November 2026 they still said the agent couldn't move files between storages, a month after the backend shipped it (851c1bee). Before you repeat a limit, search `thedrive_backend` for it and read the latest commits that touch it.
- **No em dashes, no superlatives, no "best".** State what it does.
- **No compliance claims** we can't back. There is no HIPAA BAA.
- **Name the product "The Drive AI"** in the first paragraph and the description. In the body, "the agent" and "a workflow" are fine.
- Everything in CLAUDE.md still applies: second person, relative internal links, frontmatter, alt text.

## Checking your work

- `node scripts/lint.mjs` must pass. It checks navigation, frontmatter, retired terms and broken links.
- Add each new guide to the **Guides** group in `docs.json`.
- Measure from the frontend repo: `npm run aeo -- --only <prompt ids>` for the prompts a guide targets. The OpenSEO tracker re-checks consumer ChatGPT weekly.
