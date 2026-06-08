function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildSearchChunks(cv) {
  const chunks = [];

  if (cv.summary) {
    chunks.push({ section: "summary", text: cv.summary });
  }

  for (const role of cv.experience || []) {
    const title = [role.role, role.company].filter(Boolean).join(", ");
    chunks.push({
      section: "experience",
      text: `${title} (${role.period})`,
    });
    for (const bullet of role.bullets || []) {
      chunks.push({
        section: "experience",
        text: `${title}: ${bullet}`,
      });
    }
  }

  for (const skill of cv.skills || []) {
    chunks.push({
      section: "skills",
      text: `${skill.title}: ${(skill.items || []).join(", ")}`,
    });
  }

  for (const edu of cv.education || []) {
    chunks.push({
      section: "education",
      text: `${edu.title} ${edu.institution} ${edu.period}`,
    });
    for (const detail of edu.details || []) {
      chunks.push({
        section: "education",
        text: `${edu.title}: ${detail}`,
      });
    }
  }

  if (Array.isArray(cv.languages) && cv.languages.length > 0) {
    chunks.push({ section: "languages", text: cv.languages.join(", ") });
  }

  for (const project of cv.funProjects || []) {
    chunks.push({
      section: "fun-projects",
      text: `${project.title}: ${(project.lines || []).join(" ")}`,
    });
  }

  return chunks;
}

function tokenize(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .split(" ")
    .filter((token) => token.length > 2);
}

function findRelevantChunks({ chunks, query, limit = 12 }) {
  const queryTokens = new Set(tokenize(query));

  const scored = chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.text);
      let score = 0;
      for (const token of tokens) {
        if (queryTokens.has(token)) score += 1;
      }
      if (chunk.section === "experience") score += 0.2;
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score);

  const strong = scored.filter((item) => item.score > 0).slice(0, limit);
  if (strong.length >= Math.min(6, limit)) return strong;
  return scored.slice(0, limit);
}

module.exports = {
  buildSearchChunks,
  findRelevantChunks,
};
