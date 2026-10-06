/**
 * One entry per screenshot placeholder in the docs.
 *
 *   id           short name for the command line
 *   page         the .mdx file holding the placeholder
 *   placeholder  the text inside {/* Screenshot: … *\/}, exactly
 *   file         where the image goes (under images/)
 *   alt          alt text for the published image
 *   run          drives the app; returns a locator to crop to, or nothing for the whole window
 *   manual       true when a script can't take it (phone, extension, owner-only states)
 */
const dialog = (page) => page.getByRole('dialog').last();

export const SHOTS = [
    // ── Account ───────────────────────────────────────────────────────────
    {
        id: 'profile',
        page: 'account/profile-and-sign-in.mdx',
        placeholder: 'Settings > Profile showing photo, Name, Email, Sign-in method, Appearance and Delete account',
        file: 'images/settings-profile.png',
        alt: 'Settings, Profile tab, with photo, name, email, sign-in method, appearance and Delete account',
        async run(page, h) { await h.settings('profile'); return dialog(page); },
    },
    {
        id: 'notifications',
        page: 'account/notifications.mdx',
        placeholder: 'Settings > Notifications with Browser alerts on and the three topic switches',
        file: 'images/settings-notifications.png',
        alt: 'Settings, Notifications tab, with browser alert topics and email settings',
        async run(page, h) { await h.settings('notifications'); return dialog(page); },
    },
    {
        id: 'usage',
        page: 'account/usage-and-limits.mdx',
        placeholder: 'Settings > Usage with the four meters: Assistant tasks this month, Workflow files this period, Folder organizes this month, Storage',
        file: 'images/settings-usage.png',
        alt: 'Settings, Usage tab, with the assistant tasks, workflow files, folder organizes and storage meters',
        async run(page, h) { await h.settings('usage'); return dialog(page); },
    },
    {
        id: 'bell',
        keepFocus: true,
        page: 'account/notifications.mdx',
        placeholder: "the bell's notification list open, with unread items at the top and Mark all read / Clear all at the bottom",
        file: 'images/notifications-bell.png',
        alt: 'The notification list open from the bell at the top right',
        async run(page, h) {
            await h.root();
            await page.locator('svg.lucide-bell, svg.lucide-bell-ring, svg.lucide-bell-dot').first().click();
            await h.wait(1500);
            return null;
        },
    },

    // ── Agent settings ────────────────────────────────────────────────────
    {
        id: 'agent-settings',
        page: 'agent/settings.mdx',
        placeholder: 'Settings > Agent as an owner, with the two switches at the top and the collapsed sections below',
        file: 'images/settings-agent.png',
        alt: 'Settings, Agent tab, with Available in this workspace and Save the files it makes at the top and collapsed sections below',
        async run(page, h) { await h.settings('agent'); return dialog(page); },
    },
    {
        id: 'agent-limits',
        page: 'agent/settings.mdx',
        placeholder: 'Settings > Agent > Limits and approvals, expanded, with the task size buttons, the two number fields and the save bar',
        file: 'images/settings-agent-limits.png',
        alt: 'Limits and approvals expanded, with Task size, Apply on its own and Ask once',
        async run(page, h) {
            await h.settings('agent');
            await h.expand('Limits and approvals');
            return dialog(page);
        },
    },
    {
        id: 'agent-memory',
        page: 'agent/memory-and-instructions.mdx',
        placeholder: 'Settings > Agent > What the agent remembers, expanded, with a Workspace note and a note under Yours',
        file: 'images/settings-agent-memory.png',
        alt: 'What the agent remembers expanded, with workspace notes and your own notes',
        async run(page, h) {
            await h.settings('agent');
            await h.expand('What the agent remembers');
            return dialog(page);
        },
    },
    {
        id: 'agent-can-see',
        page: 'agent/connected-drives.mdx',
        placeholder: 'Settings > Agent > What the agent can see, expanded, with Workspace files, a Google account with a shared drive under it, and a Re-scan button',
        file: 'images/settings-agent-can-see.png',
        alt: 'What the agent can see expanded, listing workspace files and connected accounts with Re-scan',
        async run(page, h) {
            await h.settings('agent');
            await h.expand('What the agent can see');
            return dialog(page);
        },
    },

    // ── Files ─────────────────────────────────────────────────────────────
    {
        id: 'tools',
        page: 'features/pdf-tools.mdx',
        placeholder: 'the thedrive.ai/tools page with the grid of tools',
        file: 'images/tools-page.png',
        alt: 'The free tools page at thedrive.ai/tools with the grid of PDF and image tools',
        async run(page, h) { await h.go('/tools'); await h.wait(5000); return null; },
    },
    {
        id: 'app',
        page: 'getting-started/interface-overview.mdx',
        placeholder: 'the whole app with the sidebar, a folder open in the file browser, and the agent panel open on the right',
        file: 'images/app-overview.png',
        alt: 'The Drive AI with the sidebar on the left, a folder open in the middle and the agent panel on the right',
        async run(page, h) { await h.root(); await h.openFolder('Finance'); return null; },
    },
    {
        id: 'list-view',
        page: 'features/browsing-and-search.mdx',
        placeholder: 'a folder in list view, with the toolbar (New, list and grid view, sort) and the path at the top',
        file: 'images/file-browser-list.png',
        alt: 'A folder in list view with New, the list and grid buttons and sort in the toolbar',
        async run(page, h) {
            await h.root(); await h.openFolder('Docs Demo');
            await page.locator('button:has(svg.lucide-list)').first().click();
            await h.wait(2000);
            return null;
        },
    },
    // ── Integrations ──────────────────────────────────────────────────────
    ...[
        ['google-drive', 'integrations/google-drive.mdx', 'Google Drive', 'Settings > Integrations > Google Drive with one connected account showing "Connected by you · Connected <date> · Agent: ready"', 'images/integrations-google-drive.png', 'Settings, Integrations, Google Drive, with a connected account, who connected it, when, and the agent status'],
        ['slack', 'integrations/slack.mdx', 'Slack', 'Settings > Integrations > Slack with one connected Slack workspace and the note about /invite @The Drive AI below it', 'images/integrations-slack.png', 'Settings, Integrations, Slack, with a connected Slack workspace'],
        ['teams', 'integrations/microsoft-teams.mdx', 'Teams', 'Settings > Integrations > Teams with the connection row headed by the covered teams, the account email beneath, and the teams button below', 'images/integrations-teams.png', 'Settings, Integrations, Teams, with the connection and the teams it covers'],
    ].map(([id, page, tile, placeholder, file, alt]) => ({
        id, page, placeholder, file, alt,
        async run(pg, h) { await h.settings('integrations'); await dialog(pg).getByText(new RegExp(`^${tile}`)).first().click(); await dialog(pg).getByText(/Connected by|Disconnect/).first().waitFor({ timeout: 45_000 }).catch(() => {}); await h.wait(2500); return dialog(pg); },
    })),
    {
        id: 'email-menu',
        keepFocus: true,
        manual: 'needs an email account connected by the demo user (the ⋯ menu is only on your own connections)',
        page: 'integrations/email-integration.mdx',
        placeholder: 'Settings > Integrations > Gmail with one connected account and its … menu open showing Historical sync, Blocked senders and Disconnect',
        file: 'images/integrations-email-menu.png',
        alt: 'Settings, Integrations, an email account with its menu open showing Historical sync, Blocked senders and Disconnect',
        async run(page, h) {
            await h.settings('integrations'); await dialog(page).getByText('Outlook', { exact: true }).click(); await h.wait(3000);
            await dialog(page).locator('button:has(svg.lucide-ellipsis), button:has(svg.lucide-more-horizontal), button[aria-haspopup=menu]').first().click(); await h.wait(1000);
            return null;
        },
    },
    {
        id: 'historical-sync',
        manual: 'needs an email account connected by the demo user (the ⋯ menu is only on your own connections)',
        page: 'integrations/email-integration.mdx',
        placeholder: 'The Historical Sync panel with the Time range menu, Include sent emails checkbox and Start Import button',
        file: 'images/integrations-historical-sync.png',
        alt: 'The Historical sync panel with Time range, Include sent emails and Start Import',
        async run(page, h) {
            await h.settings('integrations'); await dialog(page).getByText('Outlook', { exact: true }).click(); await h.wait(3000);
            await dialog(page).locator('button:has(svg.lucide-ellipsis), button:has(svg.lucide-more-horizontal), button[aria-haspopup=menu]').first().click(); await h.wait(800);
            await page.getByRole('menuitem', { name: /Historical sync/i }).click(); await h.wait(2000);
            return null;
        },
    },
    {
        id: 'mcp-add',
        page: 'agent/mcp-tools.mdx',
        placeholder: 'the "Add an MCP server" dialog with Name, Server URL, Transport and Authentication filled in',
        file: 'images/agent-mcp-add.png',
        alt: 'The Add an MCP server dialog with name, server URL, transport and authentication',
        async run(page, h) {
            await h.settings('agent'); await h.expand('What the agent can do elsewhere');
            await page.getByRole('button', { name: /Add MCP server/i }).click(); await h.wait(1500);
            const d = dialog(page);
            const inputs = d.locator('input:visible');
            await inputs.nth(0).fill('Linear');
            await inputs.nth(1).fill('https://mcp.linear.app/mcp');
            await h.wait(500);
            return d;
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); },
    },

    // ── Files, sharing ────────────────────────────────────────────────────
    {
        id: 'upload-window',
        page: 'features/uploading-files.mdx',
        placeholder: 'the upload window with a folder and two files listed, showing Add more, Clear all and Upload (3)',
        file: 'images/upload-window.png',
        alt: 'The upload window with files listed, Add more, Clear all and the Upload button',
        async run(page, h) {
            await h.root(); await h.openFolder('Docs Demo');
            await page.getByRole('button', { name: 'New' }).first().click(); await h.wait(600);
            await page.getByText('Upload', { exact: true }).first().click(); await h.wait(1200);
            const dir = new URL('./sample/', import.meta.url).pathname;
            const fs = await import('node:fs');
            const files = fs.readdirSync(dir).filter((f) => f.endsWith('.pdf')).slice(0, 3).map((f) => dir + f);
            await dialog(page).locator('input[type=file]:not([webkitdirectory])').first().setInputFiles(files); await h.wait(1200);
            return dialog(page);
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); },
    },
    {
        id: 'share-dialog',
        keepFocus: true,
        page: 'features/file-sharing.mdx',
        placeholder: 'the Share dialog with an email typed, the permission menu open, and two people listed below',
        file: 'images/share-dialog.png',
        alt: 'The Share dialog with an email typed and the permission menu open showing Full Access, Write and Read',
        async run(page, h) {
            await h.root(); await h.openFolder('Docs Demo');
            await page.locator('button:has(svg.lucide-share-2)').first().click(); await h.wait(2000);
            const d = dialog(page);
            await d.locator('input[type=email], input').first().fill('alex@example.com'); await h.wait(500);
            await d.getByRole('combobox').first().click().catch(() => {}); await h.wait(800);
            return null;
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); },
    },
    {
        id: 'pdf-viewer',
        page: 'features/browsing-and-search.mdx',
        placeholder: 'a PDF open in the viewer, showing the zoom, page, highlighter and download controls',
        file: 'images/pdf-viewer.png',
        alt: 'A PDF open in the viewer with zoom, page, highlighter and download controls',
        async run(page, h) {
            await h.root(); await h.openFolder('Docs Demo');
            await page.getByText(/^Master-Services-Agreement/).first().dblclick(); await h.wait(8000);
            return null;
        },
    },
    {
        id: 'trash',
        page: 'features/versions-and-trash.mdx',
        placeholder: 'the Trash with a deleted folder and two files, showing Restore, Delete Permanently and Clear All',
        file: 'images/trash.png',
        alt: 'The Trash with deleted items, Restore, Delete Permanently and Clear All',
        async run(page, h) { await h.go('/explorer'); await page.getByText('Trash', { exact: true }).first().click(); await h.wait(6000); return null; },
    },
    {
        id: 'create-team',
        keepFocus: true,
        page: 'account/plans-pricing.mdx',
        placeholder: 'the Create Team Workspace dialog showing the Seats picker, Annual/Monthly choice and the trial line',
        file: 'images/create-team-workspace.png',
        alt: 'The Create Team Workspace dialog with the seats picker, annual or monthly billing and the trial line',
        async run(page, h) {
            await h.go('/explorer');
            await page.getByText('The Drive AI', { exact: true }).nth(1).click(); await h.wait(800);
            await page.getByText('Create team workspace', { exact: true }).click(); await h.wait(2000);
            return dialog(page);
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); },
    },

    // ── Workflows ─────────────────────────────────────────────────────────
    {
        id: 'workflows-page',
        page: 'workflows/overview.mdx',
        placeholder: 'The Workflows page with the Workflows, Approvals and Activity tabs and two workflows listed',
        file: 'images/workflows-page.png',
        alt: 'The Workflows page with the Workflows, Approvals and Activity tabs',
        async run(page, h) { await h.go('/explorer'); await page.getByText('Workflows', { exact: true }).first().click(); await h.wait(6000); return null; },
    },
    {
        id: 'workflows-activity',
        page: 'workflows/approvals-and-activity.mdx',
        placeholder: 'The Activity tab with the All, Needs attention, In progress and Completed filters, the workflow picker and the file name search',
        file: 'images/workflows-activity.png',
        alt: 'The Activity tab with status filters, the workflow picker and file name search',
        async run(page, h) {
            await h.go('/explorer'); await page.getByText('Workflows', { exact: true }).first().click(); await h.wait(5000);
            await page.getByRole('tab', { name: /Activity/ }).click().catch(() => page.getByText('Activity', { exact: true }).first().click()); await h.wait(15000);
            return null;
        },
    },
    // ── Agent states (prompts run beforehand in Docs Demo; see README) ─────
    {
        id: 'change-card',
        page: 'agent/approving-and-undoing.mdx',
        placeholder: 'a change card marked "Needs your OK" with its title, count line, a few rows, and the Apply, Not now and Add a note buttons',
        file: 'images/agent-change-card.png',
        alt: 'A change card marked Needs your OK, with the change, the file it affects, and the Apply, Not now and Add a note buttons',
        async run(page, h) {
            await h.docsDemo(); await h.conversation('Move sales-2025.csv');
            const card = page.locator('div').filter({ has: page.getByText('Needs your OK') }).filter({ has: page.getByRole('button', { name: /Not now/ }) }).last();
            await card.scrollIntoViewIfNeeded(); await h.wait(800);
            return card;
        },
    },
    ...[
        ['agent-overview', 'agent/overview.mdx', 'the agent panel open beside a folder, with a short conversation and a change card', 'images/agent-overview.png', 'The agent panel beside a folder, with a request and a change card waiting for approval'],
        ['interface-agent', 'getting-started/interface-overview.mdx', 'the agent panel open next to a folder, with a change card showing Apply and Not now', 'images/interface-agent-panel.png', 'The agent panel next to a folder, with a change card showing Apply and Not now'],
    ].map(([id, page, placeholder, file, alt]) => ({
        id, page, placeholder, file, alt,
        async run(pg, h) {
            await h.docsDemo(); await h.conversation('Move sales-2025.csv');
            await pg.getByRole('button', { name: /Not now/ }).last().scrollIntoViewIfNeeded(); await h.wait(800);
            return null;
        },
    })),
    {
        id: 'chart-card',
        page: 'agent/charts-and-diagrams.mdx',
        placeholder: 'a chart figure card in the agent panel, showing the chart, the buttons on the right, Save to a folder and the suggestion chips',
        file: 'images/agent-chart-card.png',
        alt: 'A line chart of monthly revenue in the agent panel, with its title, buttons and Save to a folder',
        async run(page, h) {
            await h.docsDemo(); await h.conversation('Chart the m');
            const card = page.locator('div').filter({ has: page.getByText('Monthly revenue, 2025') }).filter({ has: page.getByText('Save to a folder') }).last();
            await card.scrollIntoViewIfNeeded(); await h.wait(800);
            return card;
        },
    },
    {
        id: 'file-card',
        page: 'features/document-creation.mdx',
        placeholder: 'a file card in the agent panel, showing the preview, the View and Download buttons, and Save to a folder',
        file: 'images/agent-file-card.png',
        alt: 'A file card for a one-page PDF summary, with its preview, view and download buttons, and Save to a folder',
        async run(page, h) {
            await h.docsDemo(); await h.conversation('Summarise');
            const card = page.locator('div').filter({ has: page.getByText(/Summary\.pdf|Summary/).first() }).filter({ has: page.getByText('Save to a folder') }).last();
            await card.scrollIntoViewIfNeeded(); await h.wait(800);
            return card;
        },
    },
    {
        id: 'conversation-tabs',
        page: 'agent/conversations.mdx',
        placeholder: 'the agent panel header with three conversation tabs, one with an amber dot, plus the + and History buttons',
        file: 'images/agent-conversation-tabs.png',
        alt: 'The agent panel with conversation tabs, a status dot on a conversation that needs you, and the new conversation and History buttons',
        async run(page, h) {
            await h.docsDemo();
            return page.locator('div').filter({ has: page.locator('button:has(svg.lucide-history)') }).filter({ has: page.getByPlaceholder(/Ask about|Allow above/) }).last();
        },
    },
    {
        id: 'workflow-draft-card',
        page: 'workflows/building-with-the-agent.mdx',
        placeholder: 'A workflow draft card in an agent conversation with the Draft label, the step preview, and the Open in editor and Save buttons',
        file: 'images/workflow-draft-card.png',
        alt: 'A workflow draft card in the agent panel with the Draft label, a preview of its steps, and Open in editor and Save',
        async run(page, h) {
            await h.docsDemo(); await h.conversation('Draft a workflo');
            const card = page.locator('div').filter({ has: page.getByText('Open in editor') }).filter({ has: page.getByText('Draft', { exact: true }) }).last();
            await card.scrollIntoViewIfNeeded(); await h.wait(800);
            return card;
        },
    },
    {
        id: 'canvas',
        page: 'workflows/overview.mdx',
        placeholder: 'The canvas with the Agent, Nodes and Activity tabs on the left, a few connected steps, and Validate, Active and Save in the toolbar',
        file: 'images/workflow-canvas.png',
        alt: 'The workflow editor with the Agent and Nodes tabs on the left, three connected steps, and Validate, Active and Save in the toolbar',
        async run(page, h) { await h.workflowDraft(); return null; },
    },
    {
        id: 'node-schedule',
        page: 'workflows/triggers.mdx',
        placeholder: 'The On a Schedule settings panel showing "Every weekday at 9:00 AM", Repeat, At, Where and Folder',
        file: 'images/workflow-node-schedule.png',
        alt: 'The On a Schedule settings with Every weekday at 9:00 AM, Repeat, On, At, Where and Folder',
        async run(page, h) { await h.workflowDraft(); return h.node('On a Schedule'); },
    },
    {
        id: 'node-check',
        page: 'workflows/steps.mdx',
        placeholder: 'Check File Details settings with two paths, one checking File type: PDFs and one checking Age: older than 1 year',
        file: 'images/workflow-node-check-file-details.png',
        alt: 'The Check File Details settings with a path that checks the file type for PDFs',
        async run(page, h) { await h.workflowDraft(); return h.node('Check File Details'); },
    },
    {
        id: 'node-save-copy',
        page: 'workflows/steps.mdx',
        placeholder: 'Save a Copy settings with Save to set to a Google Drive account, Location set to a shared drive, and Folder filled in',
        file: 'images/workflow-node-save-a-copy.png',
        alt: 'The Save a Copy settings with a Google Drive account chosen as the destination',
        async run(page, h) { await h.workflowDraft(); return h.node('Save a Copy'); },
    },
    {
        id: 'canvas-agent',
        page: 'workflows/building-with-the-agent.mdx',
        placeholder: 'The workflow editor with the Agent tab open, showing a "What changed on the canvas" summary with Undo this change',
        file: 'images/workflow-canvas-agent.png',
        alt: 'The workflow editor with the Agent tab open beside Nodes, after asking the agent to change the schedule',
        async run(page, h) {
            await h.workflowDraft();
            await page.getByPlaceholder(/Ask about/).last().fill('Change the schedule to 8:00 AM');
            await page.keyboard.press('Enter');
            await page.getByText(/What changed on the canvas|Worked for/).last().waitFor({ timeout: 240_000 });
            await h.wait(3000);
            return null;
        },
    },
    // ── E-signatures and file requests ────────────────────────────────────
    {
        id: 'esign-dropdown',
        page: 'features/e-sign.mdx',
        placeholder: "the Placed list with a Dropdown field's Configure popover open, showing Label, Options and Required",
        file: 'images/esign-dropdown-configure.png',
        alt: 'The e-sign editor on Place Fields, with a signature and a dropdown placed on the document and listed under Placed',
        async run(page, h) {
            await h.docsDemo();
            await page.getByText('Master-Services-Agreement-Contoso.pdf').first().dblclick(); await h.wait(7000);
            await page.locator('button:has(svg.lucide-signature)').first().click();
            await page.getByPlaceholder('Email address').waitFor({ timeout: 60_000 }); await h.wait(2500);
            if (await page.getByText(/A draft request already exists/).isVisible()) await page.getByText('Start fresh').click();
            await page.getByPlaceholder('Email address').fill('alex@example.com');
            await page.getByPlaceholder('Name (optional)').fill('Alex Morgan');
            await page.getByRole('button', { name: /Continue/ }).click(); await h.wait(3000);
            await page.getByRole('button', { name: 'Signature', exact: true }).click(); await page.mouse.click(560, 628); await h.wait(1000);
            await page.getByRole('button', { name: 'Dropdown', exact: true }).click(); await page.mouse.click(1080, 640); await h.wait(1200);
            await page.keyboard.press('Escape'); await h.wait(500);
            return null;
        },
    },
    {
        id: 'file-request-form',
        page: 'features/file-requests.mdx',
        placeholder: 'the Request files form with a two-item checklist and More options open',
        file: 'images/file-request-form.png',
        alt: 'The Request files form with title, message, a recipient, a two-item checklist and More options open',
        async run(page, h) {
            await h.settings('file-requests');
            await page.getByRole('button', { name: /New request/ }).click(); await h.wait(2500);
            const d = dialog(page);
            await d.getByPlaceholder('e.g. Q4 Tax Documents').fill('Q4 Tax Documents');
            await d.getByPlaceholder('Instructions for your recipients...').fill('Please upload your W-2 and last year\'s return by Friday.');
            await d.getByPlaceholder('Email *').fill('alex@example.com');
            await d.getByPlaceholder('Name').first().fill('Alex Morgan');
            for (const name of ['W-2', '2024 tax return']) {
                await d.getByRole('button', { name: 'Add document' }).click(); await h.wait(600);
                const fields = d.locator('input:visible');
                await fields.nth((await fields.count()) - 1).fill(name);
            }
            await d.getByRole('button', { name: 'More options' }).click(); await h.wait(1000);
            await d.getByRole('button', { name: 'More options' }).scrollIntoViewIfNeeded();
            return d;
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); },
    },
    {
        id: 'publish-dialog',
        page: 'features/file-sharing.mdx',
        placeholder: 'the Publish dialog with Publish document switched on and the Public URL showing',
        file: 'images/publish-dialog.png',
        alt: 'The Publish dialog with Publish document',
        async run(page, h) {
            await h.docsDemo();
            await page.getByText('Master-Services-Agreement-Contoso.pdf').first().dblclick(); await h.wait(7000);
            await page.getByRole('button', { name: 'Publish' }).click(); await h.wait(1500);
            return dialog(page);
        },
        cleanup: async (page) => { await page.keyboard.press('Escape'); },
    },

    // ── Not scripted: each needs a state a browser script can't set up ────
    { id: "mobile-scan", manual: "needs phone app", page: "features/document-scanning.mdx", placeholder: "the mobile file browser showing the scan button above the + button", file: "images/mobile-scan-button.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "mobile-browser", manual: "needs phone app", page: "getting-started/mobile-app.mdx", placeholder: "the mobile file browser with the workspace name at the top, the scan and + buttons, and the message bar", file: "images/mobile-file-browser.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "extension-panel", manual: "needs browser extension", page: "agent/browser-extension.mdx", placeholder: "The side panel signed in, with the workspace menu at the top, the ⋮ button, and the agent below", file: "images/extension-side-panel.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "members-seats", manual: "needs workspace owner, with no free seats", page: "account/members-and-roles.mdx", placeholder: "the Members tab with the seat notice and the Add seat & invite button", file: "images/members-seats.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "danger-zone", manual: "needs workspace owner", page: "account/settings-reference.mdx", placeholder: "Settings > Danger Zone for a team owner, showing Export workspace, Pause billing and Delete workspace", file: "images/settings-danger-zone.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "dropbox", manual: "needs a connected Dropbox account", page: "integrations/dropbox.mdx", placeholder: "Settings > Integrations > Dropbox with one connected account showing \"Connected by you · Connected <date> · Agent: ready\"", file: "images/integrations-dropbox.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "onedrive", manual: "needs a connected OneDrive account", page: "integrations/onedrive.mdx", placeholder: "Settings > Integrations > OneDrive with one connected account showing \"Connected by you · Connected <date> · Agent: ready\"", file: "images/integrations-onedrive.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "import-from-cloud", manual: "needs a Google account connected by the demo user", page: "integrations/google-drive.mdx", placeholder: "The Import from Cloud panel showing My Drive, a few selected files, the Skip duplicates switch and the Import button", file: "images/import-from-cloud.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "add-shared-drive", manual: "needs a Google account connected by the demo user", page: "agent/connected-drives.mdx", placeholder: "The \"Add a shared drive\" dialog listing an account's Google Shared Drives, one marked Added", file: "images/add-shared-drive.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "approval-card", manual: "needs a workflow run waiting on an approval step", page: "workflows/approvals-and-activity.mdx", placeholder: "An approval card showing the planned actions, the time left, Add a correction, and the Approve and Reject buttons", file: "images/workflow-approval-card.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "files-banner", manual: "needs a workspace that has used its workflow files", page: "workflows/workflow-files.mdx", placeholder: "The amber \"12 files not processed this month\" banner on the Workflows page, with Get more files", file: "images/workflow-files-banner.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "esign-request", manual: "needs a sent signature request (emails real recipients)", page: "features/e-sign.mdx", placeholder: "a request page in progress, showing recipients with statuses, the Remind and Void buttons, and the Audit Trail", file: "images/esign-request-page.png", alt: '', run: async () => { throw new Error('manual'); } },
    { id: "file-request-upload", manual: "needs a sent file request (emails real recipients)", page: "features/file-requests.mdx", placeholder: "a recipient's upload page with a checklist, one item filled and one staged, and the Submit button", file: "images/file-request-upload-page.png", alt: '', run: async () => { throw new Error('manual'); } },
];
