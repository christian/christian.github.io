# AI Cover Letter Generator (Node backend)

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Set env vars:

```bash
cp .env.example .env
# then edit .env and set OPENAI_API_KEY
```

3. Start server:

```bash
npm run dev
```

4. Open:

- `http://localhost:8787/cover-letter.html`
- API health: `http://localhost:8787/api/health`

## How it works

- Ingests CV from `index.html`.
- Extracts and ranks relevant CV chunks by job-description overlap.
- Sends ranked evidence + job description to OpenAI.
- Returns a tailored cover letter and evidence mapping.
