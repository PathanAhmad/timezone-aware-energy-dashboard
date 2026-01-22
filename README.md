# Energy Insights Dashboard (Vanilla JS + D3)

Interactive energy-consumption analytics for **15‑minute interval XML datasets**: timezone-aware charts, statistical summaries, and an optional AI assistant for natural-language questions.

Repo: [`PathanAhmad/timezone-aware-energy-dashboard`](https://github.com/PathanAhmad/timezone-aware-energy-dashboard)

## About

- **What it is**: a single-page dashboard that turns raw 15‑minute energy XML into interactive insights.
- **Who it’s for**: anyone who wants to explore consumption patterns (peaks, base load, daily totals) without uploading data to a server.
- **Why it’s interesting**: combines robust XML parsing, timezone conversion, and multiple coordinated D3 visualizations in a framework-free codebase.

## What this demonstrates (recruiter-friendly)

- **Ownership**: built end-to-end (data parsing → visualization → UX polish → optional AI integration).
- **Frontend engineering**: a full dashboard in **vanilla JavaScript** (ES modules), no framework.
- **Data visualization**: multiple D3 views (distribution + trend + intensity + flow).
- **Data parsing**: XML parsing + validation with safe fallbacks.
- **Timezone UX**: view the same underlying UTC data in different display timezones.
- **Product polish**: bilingual UI (English/German), responsive layout, printable “report”.

## Features

- **Charts**
  - Load duration curve
  - Daily totals
  - Hourly distribution (box plot + outliers)
  - Heatmap (day × hour intensity)
  - Sankey (energy flow breakdown)
- **Datasets**
  - Preloaded datasets for **Austria (real)** + **Germany/Portugal/Estonia (simulated)**
  - Upload your own `.xml` file from the UI
- **AI (optional)**
  - Chat answers questions using a summary of the currently loaded dataset (OpenAI Chat Completions)

## Quick start (local)

1. Start a local server from the repo root:

```bash
python -m http.server 8000
```

2. Open `http://localhost:8000` in your browser.

### Optional: enable AI chat locally

This project loads the API key in one of two ways:

- **Build-time injection**: `Scripts/config.js` expects `window.OPENAI_API_KEY` to be set in production builds.
- **Local dev fallback**: `Scripts/chatLogic.js` tries to `fetch('/.env')` and read `OPENAI_API_KEY=...`.

To enable AI chat **locally**, create a `/.env` file in the repo root:

```env
OPENAI_API_KEY=your_key_here
```

## Security note (important)

This is a **static frontend**. Any key provided to the browser can be extracted by a user.

- **Do not deploy a real OpenAI key in client-side code.**
- For a production-grade deployment, route AI calls through a small backend (proxy) that keeps secrets server-side and enforces rate limits.

## Repo map

```
.
├── index.html
├── Scripts/
│   ├── main.js            # dashboard orchestration + D3 charts
│   ├── xmlParser.js       # XML parsing + timezone inference
│   ├── timezoneUtils.js   # timezone conversion + detection
│   ├── chatLogic.js       # OpenAI chat integration (optional)
│   ├── languageContext.js # EN/DE UI support
│   └── config.js          # build-time API key injection hook
└── Data/
    ├── myenergydata_output.xml
    ├── data_germany.xml
    ├── data_portugal.xml
    └── data_estonia.xml
```

## Data format (example)

```xml
<Publication_MarketDocument>
  <Period>
    <timeInterval>
      <start>2025-05-01T00:00Z</start>
      <end>2025-05-02T00:00Z</end>
    </timeInterval>
    <resolution>PT15M</resolution>
    <Point>
      <position>1</position>
      <quantity>0.023</quantity>
    </Point>
  </Period>
</Publication_MarketDocument>
```

Timestamps are parsed using ISO 8601 (e.g. `YYYY-MM-DDTHH:mm:ssZ`) and converted for display depending on the selected timezone.

## Academic context

Originally built as a course project (Foundations of Networked Systems) and later polished into a recruiter-facing portfolio piece. I implemented the dashboard end-to-end.
