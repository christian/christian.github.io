const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const variants = [
  {
    data: require("../src/cv-data.json"),
    outputBase: "cv",
    labels: {
      phone: "Phone",
      summary: "Summary",
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      languages: "Languages",
      funProjects: "Fun projects",
    },
  },
  {
    data: require("../src/cv-data-ro.json"),
    outputBase: "cv-ro",
    labels: {
      phone: "Telefon",
      summary: "Rezumat",
      experience: "Experiență",
      skills: "Competențe",
      education: "Educație",
      languages: "Limbi",
      funProjects: "Proiecte personale",
    },
  },
];

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

function renderMarkdown(cv, labels) {
  const parts = [];
  parts.push(`# ${cv.name}`);
  parts.push("");
  parts.push(`${labels.phone}: ${cv.contacts.phone}  `);
  parts.push(`Email: [${cv.contacts.email}](mailto:${cv.contacts.email})  `);
  for (const social of cv.socials) {
    parts.push(`${social.label}: ${social.href}  `);
  }
  parts.push("");
  parts.push(`## ${labels.summary}`);
  parts.push("");
  parts.push(cv.summary);
  parts.push("");
  parts.push(`## ${labels.experience}`);
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
  parts.push(`## ${labels.skills}`);
  parts.push("");
  for (const skill of cv.skills) {
    parts.push(`- ${skill.title}: ${skill.items.map(markdownSkillItem).join(", ")}`);
  }
  parts.push("");
  parts.push(`## ${labels.education}`);
  parts.push("");
  for (const entry of cv.education) {
    parts.push(`- ${entry.title} — ${entry.institution} (${entry.period}).`);
    for (const detail of entry.details) {
      parts.push(`  ${detail}`);
    }
  }
  parts.push("");
  parts.push(`## ${labels.languages}`);
  parts.push("");
  parts.push(cv.languages.join(", "));
  parts.push("");
  parts.push(`## ${labels.funProjects}`);
  parts.push("");
  for (const project of cv.funProjects) {
    parts.push(`- ${project.title}: ${project.lines.join(" ")}`);
  }
  parts.push("");
  return `${parts.join("\n")}\n`;
}

function renderLatex(cv, labels) {
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
  lines.push(`${latexEscape(labels.phone)}: ${latexEscape(cv.contacts.phone)} \\\\`);
  lines.push(`Email: \\href{mailto:${cv.contacts.email}}{${latexEscape(cv.contacts.email)}} \\\\`);
  for (const social of cv.socials) {
    lines.push(`${latexEscape(social.label)}: \\href{${social.href}}{${latexEscape(social.href)}} \\\\`);
  }
  lines.push("");
  lines.push(`\\section*{${latexEscape(labels.summary)}}`);
  lines.push(latexText(cv.summary));
  lines.push("");
  lines.push(`\\section*{${latexEscape(labels.experience)}}`);
  for (const role of cv.experience) {
    lines.push(`\\subsection*{${latexEscape(roleHeading(role))} (${latexEscape(role.location)}) \\hfill ${latexEscape(role.period)}}`);
    lines.push("\\begin{itemize}");
    for (const bullet of role.bullets) {
      lines.push(`  \\item ${latexText(bullet)}`);
    }
    lines.push("\\end{itemize}");
    lines.push("");
  }
  lines.push(`\\section*{${latexEscape(labels.skills)}}`);
  lines.push("\\begin{itemize}");
  for (const skill of cv.skills) {
    lines.push(`  \\item ${latexEscape(skill.title)}: ${skill.items.map(latexSkillItem).join(", ")}`);
  }
  lines.push("\\end{itemize}");
  lines.push("");
  lines.push(`\\section*{${latexEscape(labels.education)}}`);
  lines.push("\\begin{itemize}");
  for (const entry of cv.education) {
    const details = entry.details.map((detail) => latexText(detail)).join(" ");
    lines.push(`  \\item ${latexEscape(entry.title)} --- ${latexEscape(entry.institution)} (${latexEscape(entry.period)}). ${details}`);
  }
  lines.push("\\end{itemize}");
  lines.push("");
  lines.push(`\\section*{${latexEscape(labels.languages)}}`);
  lines.push(latexEscape(cv.languages.join(", ")));
  lines.push("");
  lines.push(`\\section*{${latexEscape(labels.funProjects)}}`);
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

for (const variant of variants) {
  fs.writeFileSync(path.join(root, `${variant.outputBase}.md`), renderMarkdown(variant.data, variant.labels));
  fs.writeFileSync(path.join(root, `${variant.outputBase}.tex`), renderLatex(variant.data, variant.labels));
}
