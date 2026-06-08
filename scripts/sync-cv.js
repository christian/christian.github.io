const fs = require("fs");
const path = require("path");

const cv = require("../src/cv-data.json");

function roleHeading(role) {
  return role.company ? `${role.role}, ${role.company}` : role.role;
}

function latexEscape(value) {
  return String(value || "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function replaceLinksForLatex(value) {
  return String(value || "").replace(/(https?:\/\/[^\s]+|[A-Za-z0-9_./-]+\.html)/g, (match) => {
    const clean = match.replace(/[.,)]$/, "");
    const trailing = match.slice(clean.length);
    return `\\href{${clean}}{${latexEscape(clean)}}${trailing}`;
  });
}

function latexText(value) {
  return replaceLinksForLatex(latexEscape(value)).replace(/---/g, "--");
}

function markdownSkillItem(value) {
  return String(value || "");
}

function latexSkillItem(value) {
  return latexEscape(value).replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}");
}

function renderMarkdown() {
  const parts = [];
  parts.push(`# ${cv.name}`);
  parts.push("");
  parts.push(`Phone: ${cv.contacts.phone}  `);
  parts.push(`Email: [${cv.contacts.email}](mailto:${cv.contacts.email})  `);
  for (const social of cv.socials) {
    parts.push(`${social.label}: ${social.href}  `);
  }
  parts.push("");
  parts.push("## Summary");
  parts.push("");
  parts.push(cv.summary);
  parts.push("");
  parts.push("## Experience");
  parts.push("");
  for (const role of cv.experience) {
    parts.push(`### ${roleHeading(role)} (${role.location})`);
    parts.push(role.period);
    parts.push("");
    for (const bullet of role.bullets) {
      parts.push(`- ${bullet}`);
    }
    parts.push("");
  }
  parts.push("## Skills");
  parts.push("");
  for (const skill of cv.skills) {
    parts.push(`- ${skill.title}: ${skill.items.map(markdownSkillItem).join(", ")}`);
  }
  parts.push("");
  parts.push("## Education");
  parts.push("");
  for (const entry of cv.education) {
    parts.push(`- ${entry.title} — ${entry.institution} (${entry.period}).`);
    for (const detail of entry.details) {
      parts.push(`  ${detail}`);
    }
  }
  parts.push("");
  parts.push("## Languages");
  parts.push("");
  parts.push(cv.languages.join(", "));
  parts.push("");
  parts.push("## Fun projects");
  parts.push("");
  for (const project of cv.funProjects) {
    parts.push(`- ${project.title}: ${project.lines.join(" ")}`);
  }
  parts.push("");
  return `${parts.join("\n")}\n`;
}

function renderLatex() {
  const lines = [];
  lines.push("\\documentclass[11pt,a4paper]{article}");
  lines.push("\\usepackage[margin=1.7cm]{geometry}");
  lines.push("\\usepackage{fontspec}");
  lines.push("\\IfFontExistsTF{Source Sans 3}{");
  lines.push("  \\setmainfont{Source Sans 3}");
  lines.push("}{");
  lines.push("  \\setmainfont{Times New Roman}");
  lines.push("}");
  lines.push("\\usepackage[hidelinks]{hyperref}");
  lines.push("\\setlength{\\parindent}{0pt}");
  lines.push("\\setlength{\\parskip}{0.35em}");
  lines.push("");
  lines.push("\\begin{document}");
  lines.push("");
  lines.push(`{\\LARGE \\textbf{${latexEscape(cv.name)}}}\\\\`);
  lines.push(`Phone: ${latexEscape(cv.contacts.phone)} \\\\`);
  lines.push(`Email: \\href{mailto:${cv.contacts.email}}{${latexEscape(cv.contacts.email)}} \\\\`);
  for (const social of cv.socials) {
    lines.push(`${latexEscape(social.label)}: \\href{${social.href}}{${latexEscape(social.href)}} \\\\`);
  }
  lines.push("");
  lines.push("\\section*{Summary}");
  lines.push(latexText(cv.summary));
  lines.push("");
  lines.push("\\section*{Experience}");
  for (const role of cv.experience) {
    lines.push(`\\subsection*{${latexEscape(roleHeading(role))} (${latexEscape(role.location)}) \\hfill ${latexEscape(role.period)}}`);
    lines.push("\\begin{itemize}");
    for (const bullet of role.bullets) {
      lines.push(`  \\item ${latexText(bullet)}`);
    }
    lines.push("\\end{itemize}");
    lines.push("");
  }
  lines.push("\\section*{Skills}");
  lines.push("\\begin{itemize}");
  for (const skill of cv.skills) {
    lines.push(`  \\item ${latexEscape(skill.title)}: ${skill.items.map(latexSkillItem).join(", ")}`);
  }
  lines.push("\\end{itemize}");
  lines.push("");
  lines.push("\\section*{Education}");
  lines.push("\\begin{itemize}");
  for (const entry of cv.education) {
    const details = entry.details.map((detail) => latexText(detail)).join(" ");
    lines.push(`  \\item ${latexEscape(entry.title)} --- ${latexEscape(entry.institution)} (${latexEscape(entry.period)}). ${details}`);
  }
  lines.push("\\end{itemize}");
  lines.push("");
  lines.push("\\section*{Languages}");
  lines.push(latexEscape(cv.languages.join(", ")));
  lines.push("");
  lines.push("\\section*{Fun projects}");
  lines.push("\\begin{itemize}");
  for (const project of cv.funProjects) {
    lines.push(`  \\item ${latexEscape(project.title)}: ${project.lines.map((line) => latexText(line)).join(" ")}`);
  }
  lines.push("\\end{itemize}");
  lines.push("");
  lines.push("\\end{document}");
  lines.push("");
  return lines.join("\n");
}

const root = path.resolve(__dirname, "..");
fs.writeFileSync(path.join(root, "cv.md"), renderMarkdown());
fs.writeFileSync(path.join(root, "cv.tex"), renderLatex());
