# Sahiba CRM Dashboard

Wholesale fashion CRM built for **SAHIBA** — a women's wholesale fashion brand based in Mexico City.

## Features

- **Lead Management** — Priority scoring (P1/P2/P3), buy-likelihood algorithm, payment detection
- **Agent Task Queues** — Dedicated call lists for Jazmin, Nancy, and Yoana
- **Agent Check-ins** — ✅ Called, 💬 Messaged, ❌ No Answer, 📅 Callback with comments
- **Google Sheets Integration** — Load data from Google Sheets so all agents see the same data
- **City Mapping** — 397 Mexican LADA codes mapped to cities for automatic lead location
- **Lead Map** — Visual map of Mexico showing lead hotspots by city
- **Performance Analytics** — Agent comparison, conversion tracking
- **Watchlist** — Auto-flags high-risk leads
- **WhatsApp Integration** — Follow-up templates with direct WhatsApp links
- **Excel Export** — Download call lists and reports

## Setup

### 1. Deploy the Dashboard

Deploy `index.html` to any static hosting (Netlify, GitHub Pages, Vercel):

- **Netlify**: Drag and drop at [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages**: Push to repo → Settings → Pages → Deploy from main branch

### 2. Setup Google Apps Script

1. Open [Google Apps Script](https://script.google.com)
2. Create a new project linked to your Google Sheet
3. Paste the contents of `google_apps_script.js`
4. Deploy as Web App (Execute as: Me, Access: Anyone)
5. Copy the deployment URL and update `GAS_URL` in `index.html`

### 3. Import Data

1. Export **Contacts** and **Messages** CSVs from Respond.io
2. Import into your Google Sheet:
   - **CRM Contacts** tab — Contacts CSV
   - **CRM Messages** tab — Messages CSV
3. Agents open the dashboard → click **☁️ Load Data**

## Google Sheet Tabs

| Tab | Purpose |
|-----|---------|
| CRM Contacts | Contact data (name, phone, lifecycle, assignee, city) |
| CRM Messages | Chat messages (date, content, direction) |
| Agent Log | Agent check-in history (auto-created) |

## Tech Stack

- Vanilla HTML/CSS/JavaScript (single file, no build step)
- Google Apps Script (data serving + agent log)
- Google Sheets (data storage)
- PapaParse (CSV parsing)
- SheetJS (Excel export)
