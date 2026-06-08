const path = require("path");
const express = require("express");
const OpenAI = require("openai");
const cv = require("./src/cv-data.json");
const { buildSearchChunks, findRelevantChunks } = require("./src/cv-ingest");

const app = express();
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(__dirname)));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/cover-letter", async (req, res) => {
  try {
    const { jobDescription, company = "", role = "", tone = "professional", length = "medium" } = req.body || {};
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "jobDescription is required" });
    }
    const openai = getOpenAIClient();
    if (!openai) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server" });
    }

    const chunks = buildSearchChunks(cv);
    const relevant = findRelevantChunks({
      chunks,
      query: `${role} ${company} ${jobDescription}`,
      limit: 18,
    });

    const systemPrompt = [
      "You are a precise career writing assistant.",
      "Write a tailored cover letter using ONLY the provided CV evidence.",
      "The cover letter must be optimized for quick scanning: mostly bullet points, minimal prose.",
      "Use this structure: short greeting, one original tailored sentence, one sentence saying the candidate is looking for a place to grow current skills, the line 'This is what I bring:', 5-7 concise bullets, then one brief closing line.",
      "Do not write paragraph-style body text.",
      "Start each bullet with a bold 2-4 word label, then one concrete match between the role and the candidate's CV evidence.",
      "Keep bullets to one sentence each whenever possible.",
      "Avoid generic motivation paragraphs, long introductions, repeated claims, and filler.",
      "Do not invent employers, dates, responsibilities, degrees, or skills.",
      "If evidence is weak for a requirement, acknowledge it briefly without fabrication.",
      "Keep it concise, concrete, and credible.",
      "Output markdown only.",
    ].join(" ");

    const userPrompt = `
Target company: ${company || "N/A"}
Target role: ${role || "N/A"}
Requested tone: ${tone}
Requested length: ${length}

Job description:
${jobDescription}

Candidate profile:
${JSON.stringify(
      {
        name: cv.name,
        summary: cv.summary,
        contacts: cv.contacts,
      },
      null,
      2
    )}

Relevant CV evidence (ranked):
${relevant.map((item, index) => `${index + 1}. [${item.section}] ${item.text}`).join("\n")}

Return exactly:
1) Cover Letter (markdown): quick-scanning bullet-point letter with this exact flow: short greeting, one original tailored sentence, one sentence like "I'm looking for a place where I can grow my current skills while contributing to meaningful engineering work.", the line "This is what I bring:", 5-7 concise bullets, and one brief closing line. Use no paragraph-style body text.
2) Matching Evidence bullets: 5-10 bullets mapping key claims to CV evidence lines
`;

    const response = await openai.responses.create({
      model: process.env.COVER_LETTER_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    const output = response.output_text || "No output generated.";
    return res.json({
      output,
      topEvidence: relevant,
      model: process.env.COVER_LETTER_MODEL || "gpt-4.1-mini",
    });
  } catch (error) {
    const message = error?.message || "Unexpected error";
    return res.status(500).json({ error: message });
  }
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`AI CV server running at http://${host}:${port}`);
});
