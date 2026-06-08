function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeHref(value) {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("/")
  ) {
    return value;
  }
  if (value.endsWith(".html")) return `./${value}`;
  return `https://${value}`;
}

function badge(label, className, attrs = "") {
  return `<span class="${className}"${attrs}>${label}</span>`;
}

function highlightPlainText(text) {
  return text.replace(
    /\b(Founded and bootstrapped|Reverse-engineered|Initiated and led|Ruby on Rails|Scala\/Akka|REST APIs|CI\/CD|Elasticsearch|Logstash|Kibana|PostgreSQL|AWS|GCP|Scala|Akka|Rails|led)\b/g,
    (match) => {
      if (match === "AWS") return badge("AWS", "cloud-highlight", ' data-tooltip="Amazon Web Services"');
      if (match === "GCP") return badge("GCP", "cloud-highlight", ' data-tooltip="Google Cloud Platform"');
      if (match === "Scala/Akka") {
        return `${badge("Scala", "term-highlight")}/${badge("Akka", "term-highlight")}`;
      }
      if (["Elasticsearch", "Logstash", "Kibana"].includes(match)) {
        return badge(match, "blue-underline");
      }
      if (["Founded and bootstrapped", "Reverse-engineered", "Initiated and led", "led"].includes(match)) {
        return badge(match, "action-highlight");
      }
      return badge(match, "term-highlight");
    }
  );
}

function linkifyText(raw, { highlight = true } = {}) {
  const escaped = escapeHtml(raw);
  const linkPattern = /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?|[A-Za-z0-9_./-]+\.html)/gi;
  let output = "";
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(escaped)) !== null) {
    output += highlight ? highlightPlainText(escaped.slice(lastIndex, match.index)) : escaped.slice(lastIndex, match.index);

    let core = match[0];
    let trailing = "";
    while (/[.,)]/.test(core.slice(-1))) {
      trailing = core.slice(-1) + trailing;
      core = core.slice(0, -1);
    }

    const href = escapeHtml(normalizeHref(core));
    const liveBadge = core === "https://comerz.ro" ? badge("LIVE", "site-badge") : "";
    output += `<a href="${href}" target="_blank" rel="noreferrer">${core}</a>${liveBadge}${trailing}`;
    lastIndex = match.index + match[0].length;
  }

  output += highlight ? highlightPlainText(escaped.slice(lastIndex)) : escaped.slice(lastIndex);
  return output;
}

function roleHeading(role) {
  return role.company ? `${role.role}, ${role.company}` : role.role;
}

function renderLocation(location) {
  const flagSpans = [];
  if (location.includes("Switzerland") || location.includes("Zürich")) {
    flagSpans.push('<span class="location-flag location-flag--switzerland" aria-label="Switzerland">🇨🇭</span>');
  }
  if (location.includes("Romania") || location.includes("Cluj-Napoca")) {
    flagSpans.push('<span class="location-flag" aria-label="Romania">🇷🇴</span>');
  }

  return `${escapeHtml(location)}${flagSpans.length ? ` ${flagSpans.join(" ")}` : ""}`;
}

function renderExperience(experience) {
  return experience
    .map((role) => {
      const bullets = role.bullets.map((bullet) => `<li>${linkifyText(bullet)}</li>`).join("");
      return `
        <article>
          <h3>${escapeHtml(roleHeading(role))} (${renderLocation(role.location)})</h3>
          <p class="period">${escapeHtml(role.period)}</p>
          <ul>${bullets}</ul>
        </article>
      `;
    })
    .join("");
}

function renderSkillItem(item) {
  const emphasized = escapeHtml(item).replace(/\*\*(.+?)\*\*/g, "$1");
  return highlightPlainText(emphasized);
}

function renderSkills(skills) {
  return skills
    .map((skill) => `<p><strong>${escapeHtml(skill.title)}:</strong> ${skill.items.map(renderSkillItem).join(", ")}</p>`)
    .join("");
}

function renderEducation(education) {
  return education
    .map((entry) => {
      const detailLines = entry.details
        .map((detail) => `<p class="indent">${linkifyText(detail)}</p>`)
        .join("");
      return `
        <p><strong>${escapeHtml(entry.title)}</strong> - ${escapeHtml(entry.institution)} (${escapeHtml(entry.period)})</p>
        ${detailLines}
      `;
    })
    .join("");
}

function renderLanguages(languages) {
  return `<p>${languages.map(escapeHtml).join(", ")}</p>`;
}

function renderFunProjects(funProjects) {
  const items = funProjects
    .map((project) => {
      const lines = project.lines.map((line) => linkifyText(line)).join(" ");
      return `<li><strong>${escapeHtml(project.title)}:</strong> ${lines}</li>`;
    })
    .join("");
  return `<ul>${items}</ul>`;
}

async function init() {
  const response = await fetch("./src/cv-data.json");
  if (!response.ok) throw new Error("Failed to load CV data");
  const cv = await response.json();

  document.getElementById("summary-content").textContent = cv.summary;
  document.getElementById("experience-content").innerHTML = renderExperience(cv.experience);
  document.getElementById("skills-content").innerHTML = renderSkills(cv.skills);
  document.getElementById("education-content").innerHTML = renderEducation(cv.education);
  document.getElementById("languages-content").innerHTML = renderLanguages(cv.languages);
  document.getElementById("fun-projects-content").innerHTML = renderFunProjects(cv.funProjects);
}

init().catch(() => {
  const fallback = document.getElementById("summary-content");
  if (fallback) {
    fallback.textContent = "Could not load CV content. Make sure you are serving the site via HTTP.";
  }
});
