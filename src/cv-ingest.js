const fs = require("fs");
const cheerio = require("cheerio");

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function collectListItems($scope) {
  return $scope
    .find("li")
    .toArray()
    .map((li) => normalizeWhitespace(cheerio.load(li).text()))
    .filter(Boolean);
}

function ingestCvFromHtml(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  const name = normalizeWhitespace($("h1").first().text());
  const summary = normalizeWhitespace(
    $("section")
      .filter((_i, el) => normalizeWhitespace($(el).find("h2").first().text()) === "Summary")
      .find("p")
      .first()
      .text()
  );

  const contacts = normalizeWhitespace($(".contact").first().text());
  const socials = $(".socials a")
    .toArray()
    .map((a) => ({
      label: normalizeWhitespace($(a).text()),
      href: $(a).attr("href") || "",
    }));

  const experienceSection = $("section").filter(
    (_i, el) => normalizeWhitespace($(el).find("h2").first().text()) === "Experience"
  );
  const experience = experienceSection
    .find("article")
    .toArray()
    .map((article) => {
      const el = $(article);
      return {
        title: normalizeWhitespace(el.find("h3").first().text()),
        period: normalizeWhitespace(el.find(".period").first().text()),
        bullets: collectListItems(el),
      };
    });

  const skillsSection = $("section").filter(
    (_i, el) => normalizeWhitespace($(el).find("h2").first().text()) === "Skills"
  );
  const skills = skillsSection
    .find("p")
    .toArray()
    .map((p) => normalizeWhitespace($(p).text()))
    .filter(Boolean);

  const educationSection = $("section").filter(
    (_i, el) => normalizeWhitespace($(el).find("h2").first().text()) === "Education"
  );
  const education = educationSection
    .find("p")
    .toArray()
    .map((p) => normalizeWhitespace($(p).text()))
    .filter(Boolean);

  const languagesSection = $("section").filter(
    (_i, el) => normalizeWhitespace($(el).find("h2").first().text()) === "Languages"
  );
  const languages = normalizeWhitespace(languagesSection.find("p").first().text());

  const funSection = $("section").filter((_i, el) => {
    const title = normalizeWhitespace($(el).find("h2").first().text()).toLowerCase();
    return title.includes("fun projects");
  });
  const funProjects = collectListItems(funSection);

  return {
    name,
    summary,
    contacts,
    socials,
    experience,
    skills,
    education,
    languages,
    funProjects,
  };
}

function buildSearchChunks(cv) {
  const chunks = [];
  if (cv.summary) {
    chunks.push({ section: "summary", text: cv.summary });
  }

  for (const role of cv.experience) {
    chunks.push({
      section: "experience",
      text: `${role.title} (${role.period})`,
    });
    for (const bullet of role.bullets) {
      chunks.push({
        section: "experience",
        text: `${role.title}: ${bullet}`,
      });
    }
  }

  for (const skill of cv.skills) {
    chunks.push({ section: "skills", text: skill });
  }

  for (const edu of cv.education) {
    chunks.push({ section: "education", text: edu });
  }

  if (cv.languages) {
    chunks.push({ section: "languages", text: cv.languages });
  }

  for (const project of cv.funProjects) {
    chunks.push({ section: "fun-projects", text: project });
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
  ingestCvFromHtml,
  buildSearchChunks,
  findRelevantChunks,
};
