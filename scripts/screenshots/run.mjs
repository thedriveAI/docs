#!/usr/bin/env node
/**
 * Docs screenshots, taken from the live app with Playwright.
 *
 *   PLAYWRIGHT=/path/to/node_modules/playwright/index.mjs node scripts/screenshots/run.mjs [id ...]
 *   node scripts/screenshots/run.mjs --list
 *   node scripts/screenshots/run.mjs --apply      # swap placeholders for the images that exist
 *
 * Credentials come from ~/.thedrive-docs-demo.env (THEDRIVE_DEMO_EMAIL, THEDRIVE_DEMO_PASSWORD);
 * the signed-in session is kept in ~/.cache/thedrive-docs/state.json. Nothing secret is written here.
 * See README.md.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS } from './shots.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = process.env.THEDRIVE_URL ?? 'https://thedrive.ai';
const WORKSPACE = process.env.THEDRIVE_WORKSPACE ?? 'The Drive AI';
const CACHE = path.join(os.homedir(), '.cache', 'thedrive-docs');
const STATE = path.join(CACHE, 'state.json');
const args = process.argv.slice(2);

if (args.includes('--list')) {
    for (const s of SHOTS) console.log(`${s.id.padEnd(22)} ${fs.existsSync(path.join(ROOT, s.file)) ? '✓' : ' '} ${s.page.padEnd(42)} ${s.manual ? '(manual: ' + s.manual + ')' : ''}`);
    process.exit(0);
}

if (args.includes('--apply')) {
    let n = 0;
    for (const s of SHOTS) {
        if (!fs.existsSync(path.join(ROOT, s.file))) continue;
        const file = path.join(ROOT, s.page);
        const src = fs.readFileSync(file, 'utf8');
        const re = new RegExp(`\\{/\\* Screenshot: ${s.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\*/\\}`);
        const m = src.match(re);
        if (!m) continue;
        const indent = src.slice(src.lastIndexOf('\n', m.index) + 1, m.index);
        const frame = [`<Frame>`, `  <img src="/${s.file}" alt="${s.alt}" />`, `</Frame>`].join(`\n${indent}`);
        fs.writeFileSync(file, src.replace(re, frame));
        n++;
        console.log(`applied ${s.id} → ${s.page}`);
    }
    console.log(`${n} placeholder(s) replaced`);
    process.exit(0);
}

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');

function credentials() {
    const file = path.join(os.homedir(), '.thedrive-docs-demo.env');
    const env = Object.fromEntries(fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.includes('='))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
    return { email: env.THEDRIVE_DEMO_EMAIL, password: env.THEDRIVE_DEMO_PASSWORD };
}

async function signIn(browser) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const { email, password } = credentials();
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', password);
    await page.click('button[type=submit]');
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 60_000 });
    // The session remembers the open workspace; land it on the one the docs are shot in.
    await page.getByText('New conversation').first().waitFor({ timeout: 60_000 });
    const personal = page.getByText('Personal', { exact: true }).first();
    if (WORKSPACE !== 'Personal' && await personal.isVisible()) {
        await personal.click();
        await page.getByText(WORKSPACE, { exact: true }).last().click();
        await page.getByText('Finance', { exact: true }).first().waitFor({ timeout: 60_000 });
    }
    fs.mkdirSync(CACHE, { recursive: true });
    await ctx.storageState({ path: STATE });
    fs.chmodSync(STATE, 0o600);
    await ctx.close();
}

/** Helpers every shot gets. */
function helpers(page) {
    const h = {
        base: BASE,
        wait: (ms) => page.waitForTimeout(ms),
        async go(p) {
            await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
            if (p.startsWith('/explorer') || p.startsWith('/workflows')) await h.ensureWorkspace(p);
        },
        /** The app opens on whichever workspace it last had; make it the docs workspace. */
        async ensureWorkspace(p) {
            await page.getByText('New conversation').first().waitFor({ timeout: 60_000 });
            await h.wait(2500);
            const personal = page.getByText('Personal', { exact: true }).first();
            if (WORKSPACE === 'Personal' || !(await personal.isVisible())) return;
            await personal.click();
            await page.getByText(WORKSPACE, { exact: true }).last().click();
            await h.wait(4000);
            await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
            await page.getByText('New conversation').first().waitFor({ timeout: 60_000 });
        },
        /** The workspace root, once its folders have drawn. */
        async root() { await h.go('/explorer'); await page.getByText('Finance', { exact: true }).first().waitFor({ timeout: 60_000 }); await h.wait(1500); },
        async settings(tab) {
            await h.go('/explorer');
            await page.goto(`${BASE}/explorer?settings=${tab}`, { waitUntil: 'domcontentloaded' });
            await page.getByRole('dialog').waitFor({ timeout: 60_000 });
            await h.wait(3000);
        },
        /** Expand a collapsible Settings section and bring its header to the top of the window. */
        async expand(label) {
            const head = page.getByRole('dialog').last().getByText(label, { exact: true });
            await head.click();
            await h.wait(1500);
            await head.evaluate((e) => {
                e.scrollIntoView({ block: 'start' });
                let el = e.parentElement;
                while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement;
                el?.scrollBy(0, -48);
            });
            await h.wait(500);
        },
        /** The sample folder the agent shots run in. */
        async docsDemo() {
            await h.root(); await h.openFolder('Docs Demo');
            await page.getByText('Master-Services-Agreement-Contoso.pdf').first().waitFor({ timeout: 60_000 });
            await h.wait(1500);
        },
        /** Bring a conversation forward by the start of its title (an open tab, else History). */
        async conversation(title) {
            const tab = page.getByText(new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).first();
            if (!(await tab.isVisible().catch(() => false))) {
                await page.locator('button:has(svg.lucide-history)').first().click(); await h.wait(1500);
            }
            await tab.click(); await h.wait(4000);
        },
        /** The unsaved workflow the agent drafted in Docs Demo, opened in the editor (never saved). */
        async workflowDraft() {
            await h.docsDemo(); await h.conversation('Draft a workflo');
            await page.getByText('Open in editor').last().click();
            await page.getByText('Validate', { exact: true }).waitFor({ timeout: 60_000 });
            await h.wait(4000);
        },
        /** The settings panel of a step on the canvas. */
        async node(name) {
            await page.getByText(name, { exact: true }).first().click(); await h.wait(2000);
            return page.locator('div').filter({ has: page.getByText('Delete node') }).filter({ has: page.getByText(name, { exact: true }) }).last();
        },
        /** Open a folder from the current view by its name. */
        async openFolder(name) { await page.getByText(name, { exact: true }).first().dblclick(); await h.wait(4000); },
    };
    return h;
}

/** Screenshot a locator with some room around it, or the viewport when the shot returns nothing. */
async function capture(page, target, out, pad = 16, keepFocus = false) {
    if (!keepFocus) {
        await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
        await page.mouse.move(0, 0);
    }
    if (!target) return page.screenshot({ path: out });
    const box = await target.boundingBox();
    const vp = page.viewportSize();
    const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad);
    return page.screenshot({ path: out, clip: { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) } });
}

const wanted = args.filter((a) => !a.startsWith('--'));
const shots = wanted.length ? SHOTS.filter((s) => wanted.includes(s.id)) : SHOTS.filter((s) => !s.manual);
if (!shots.length) { console.error('no matching shots; try --list'); process.exit(1); }

const browser = await chromium.launch();
if (!fs.existsSync(STATE) || args.includes('--login')) await signIn(browser);
let failed = 0;
for (const s of shots) {
    const ctx = await browser.newContext({ storageState: STATE, viewport: s.viewport ?? { width: 1440, height: 900 }, colorScheme: 'light', deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
        const target = await s.run(page, helpers(page));
        const out = path.join(ROOT, s.file);
        await capture(page, target, out, s.pad, s.keepFocus);
        console.log(`✓ ${s.id} → ${s.file}`);
    } catch (e) {
        failed++;
        const dbg = path.join(CACHE, `${s.id}.failed.png`);
        await page.screenshot({ path: dbg }).catch(() => {});
        console.log(`✗ ${s.id}: ${e.message.split('\n')[0]} (see ${dbg})`);
    } finally {
        await s.cleanup?.(page, helpers(page)).catch(() => {});
        await ctx.close();
    }
}
await browser.close();
process.exit(failed ? 1 : 0);
