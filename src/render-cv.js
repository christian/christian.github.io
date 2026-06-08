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

function linkifyText(raw) {
  const escaped = escapeHtml(raw);
  return escaped.replace(
    /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?|[A-Za-z0-9_./-]+\.html)/g,
    (match) => {
      let core = match;
      let trailing = "";
      while (/[.,)]/.test(core.slice(-1))) {
        trailing = core.slice(-1) + trailing;
        core = core.slice(0, -1);
      }
      const href = escapeHtml(normalizeHref(core));
      return `<a href="${href}" target="_blank" rel="noreferrer">${core}</a>${trailing}`;
    }
  );
}

function roleHeading(role) {
  return role.company ? `${role.role}, ${role.company}` : role.role;
}

function renderExperience(experience) {
  return experience
    .map((role) => {
      const bullets = role.bullets.map((bullet) => `<li>${linkifyText(bullet)}</li>`).join("");
      return `
        <article>
          <h3>${escapeHtml(roleHeading(role))} (${escapeHtml(role.location)})</h3>
          <p class="period">${escapeHtml(role.period)}</p>
          <ul>${bullets}</ul>
        </article>
      `;
    })
    .join("");
}

function renderSkillItem(item) {
  return escapeHtml(item).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
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
