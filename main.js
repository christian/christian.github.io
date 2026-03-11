import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const MAIN_RADIUS = 50;
const OUTER_RADIUS = 520;
const CHILD_QUARTER_INNER_RADIUS = 112;
const CHILD_QUARTER_OUTER_RADIUS = 162;
const EDGE_LENGTH_FACTOR = 0.12;
const categories = [
  { id: "employment", label: "Employment", color: "#b8e1ff" },
  { id: "fun-projects", label: "Fun projects", color: "#ffd6e0" },
  { id: "education", label: "Education", color: "#d4f7dc" },
  { id: "skills", label: "Skills", color: "#e6dcff" },
];
const highlightsByCategory = {
  employment: [
    { id: "emp-1", title: "Independent contractor · Founder/Engineer", meta: "Jan 2025 - Feb 2026" },
    { id: "emp-2", title: "Zerofy · Senior Software Engineer", meta: "Jan 2024 - Feb 2025" },
    { id: "emp-3", title: "PTC Schweiz · Senior Software Engineer", meta: "Oct 2015 - Jan 2024" },
    { id: "emp-4", title: "Qualcomm · Senior Engineer", meta: "Jan 2014 - Oct 2015" },
    { id: "emp-5", title: "Kooaba · Software Engineer", meta: "Feb 2011 - Jan 2014" },
    { id: "emp-6", title: "Alliants · Head of Technology", meta: "Sep 2008 - Feb 2011" },
  ],
  "fun-projects": [
    {
      id: "fun-1",
      title: "Virtual Private Organ",
      meta: "Since 2013",
    },
    {
      id: "fun-2",
      title: "Christmas concerto",
      meta: "2025",
    },
    {
      id: "fun-3",
      title: "LilyPond engraving",
      meta: "Ongoing",
    },
    {
      id: "fun-4",
      title: "e-commerce solution",
      meta: "Since 2012",
    },
  ],
  education: [
    { id: "edu-1", title: "Babes-Bolyai University · MSc Computer Science", meta: "2008-2010" },
    { id: "edu-2", title: "Alexandru Ioan Cuza University · BSc Computer Science", meta: "2005-2008" },
    { id: "edu-3", title: "Machine Learning Course · Andrew Ng", meta: "2011" },
  ],
  skills: [
    { id: "skill-1", title: "Languages", meta: "" },
    { id: "skill-2", title: "Frameworks", meta: "" },
    { id: "skill-3", title: "Cloud", meta: "" },
    { id: "skill-4", title: "Data / Search", meta: "" },
    { id: "skill-5", title: "Tooling", meta: "" },
    { id: "skill-6", title: "REST APIs", meta: "" },
  ],
};
const deepDetailsByHighlight = {
  "emp-1": {
    title: "Independent contractor",
    lines: [
      "Transitioned into independent contracting to explore diverse projects and clients.",
      "Founded and bootstrapped an e-commerce platform MVP for customizable online stores; launched at comerz.ro.",
      "Built as multitenant Ruby on Rails + PostgreSQL solution.",
      "Enjoyed generative AI capabilities: codex, conductor, linear.",
    ],
  },
  "emp-2": {
    title: "Zerofy",
    lines: [
      "Built serverless event-driven workflows with Google Cloud Functions, Firebase, and Node.js on GCP.",
      "Supported the Zerofy mobile frontend (live app).",
      "Integrated external vendor APIs, including reverse-engineered interfaces when documentation was unavailable.",
      "Reduced technical debt through targeted refactors and cleanup.",
    ],
  },
  "emp-3": {
    title: "PTC Schweiz",
    lines: [
      "Built, owned and operated Vuforia Cloud microservices (Scala, Akka) for manufacturing Augmented Reality products on AWS.",
      "Collaborated with ML engineers to integrate models into production APIs and containerized services, and wrote a data pipeline/workflow orchestration for ML models from scratch.",
      "Implemented end-to-end automated tests in Scala for REST APIs and reduced on-call incidents.",
      "Developed CI/CD pipelines with GitHub Actions and TeamCity.",
      "Delivered major refactors and contributed to internal deployment tooling.",
      "Led initiatives to build internal tools improving productivity across teams.",
      "Integrated Veracode and Snyk into the development workflow.",
      "Implemented security best practices after recurring security training (OWASP, remote).",
      "Implemented Single Sign On auth with Amazon Cognito.",
      "Contributed to observability with Elasticsearch, Logstash, Kibana.",
      "Authored API documentation using OpenAPI v3.",
      "Implemented WebSocket proxy service for real-time collaboration (remote assistance, Chalk).",
      "Conducted technical interviews and contributed to hiring decisions.",
    ],
  },
  "emp-4": {
    title: "Qualcomm",
    lines: [
      "Expanded cloud services with Scala and Play on AWS.",
      "Automated operations and built internal tooling tasks using Python and Bash.",
      "Ported services to Docker and maintained legacy Ruby on Rails systems.",
      "Designed and built an internal Ruby DSL for cross-team API testing.",
      "Participated in scaling infrastructure from a few to hundreds of EC2 instances on AWS (S3, SQS, DynamoDB, Cognito, Autoscaling).",
    ],
  },
  "emp-5": {
    title: "Kooaba",
    lines: [
      "Initiated and led the move from a monolith to Scala microservices, increasing scalability and reducing memory usage.",
      "Built REST APIs and backend services with Ruby on Rails.",
      "Rewrote and maintained an Android application.",
      "Performed MySQL optimizations and updates on live databases with 30m+ rows.",
    ],
  },
  "emp-6": {
    title: "Alliants",
    lines: [
      "Hired and led a small team of 3 engineers delivering Ruby on Rails apps for different customers.",
      "Coordinated on-site delivery with customers in London.",
    ],
  },
  "fun-1": {
    title: "Virtual Private Organ",
    lines: [
      "Since 2013, building and evolving a Virtual Private Organ musical instrument.",
      "Initial story: hauptwerk/virtual-private-organ.html",
      "Includes Arduino programming: github.com/christian/virtual-organ/tree/master/ArduinoCombinationPistons",
    ],
    image: "./index_files/hauptwerk.jpg",
    imageAlt: "Virtual Private Organ",
  },
  "fun-2": {
    title: "Christmas concerto",
    lines: [
      "In 2025, conducted a small Christmas concerto with our small choir and orchestra.",
      "Photo gallery: vanessaphotography20.pixieset.com/colindulluminii",
    ],
  },
  "fun-3": {
    title: "LilyPond engraving",
    lines: [
      "Big fan of LilyPond for engraving sheet music.",
      "lilypond.org",
    ],
    image: "./index_files/favicon.ico",
    imageAlt: "LilyPond logo",
  },
  "fun-4": {
    title: "e-commerce solution",
    lines: [
      "Bootstrapped and maintained e-commerce solution with multiple API integrations.",
      "Live since 2012: perlasuferintei.ro",
    ],
  },
  "edu-1": {
    title: "MSc Computer Science",
    lines: [
      "Babes-Bolyai University, Cluj-Napoca (2008-2010).",
      "Thesis: Recommender Systems using Collaborative Filtering.",
      "github.com/christian/Rho-article",
    ],
  },
  "edu-2": {
    title: "BSc Computer Science",
    lines: [
      "Alexandru Ioan Cuza University, Iasi (2005-2008).",
      "Thesis: Mobile Recommender System.",
    ],
  },
  "edu-3": {
    title: "Machine Learning Course",
    lines: [
      "Machine learning course with Andrew Ng.",
      "Back in 2011, before Coursera was invented.",
    ],
    image: "./index_files/41112.jpg",
    imageAlt: "Andrew Ng course certificate",
  },
  "skill-1": {
    title: "Languages",
    lines: [
      "Ruby, Python, Scala, JavaScript, Bash.",
      "Strong backend focus, comfortable across the stack.",
    ],
  },
  "skill-2": {
    title: "Frameworks and Libraries",
    lines: [
      "Rails, Akka, Play, Node.js.",
      "Built and operated production APIs and services.",
    ],
  },
  "skill-3": {
    title: "Cloud and Infrastructure",
    lines: [
      "AWS, GCP, Docker, Kubernetes.",
      "Cloud-native services, scaling, and operational ownership.",
    ],
  },
  "skill-4": {
    title: "Data and Search",
    lines: [
      "MySQL, Elasticsearch, Kibana.",
      "Large datasets, optimization, and production analytics.",
    ],
  },
  "skill-5": {
    title: "Testing and Tooling",
    lines: [
      "GitHub Actions, TeamCity, LaTeX, Open API, Linux.",
      "Automation-first approach for delivery and reliability.",
    ],
  },
  "skill-6": {
    title: "REST APIs",
    lines: [
      "OAuth2, JWT, SSO.",
      "Designed and shipped secure API platforms.",
    ],
  },
};
const DETAIL_OFFSET_X = 34;
const DETAIL_CARD_WIDTH = 360;
const DETAIL_CARD_HEIGHT = 108;
const DETAIL_CARD_GAP = 18;
const SUB_DETAIL_OFFSET_X = 56;
const SUB_DETAIL_MIN_WIDTH = 420;
const SUB_DETAIL_HEIGHT = 320;

const app = d3.select("#app");
const svg = app.append("svg").attr("class", "map-svg").attr("role", "img");
const defs = svg.append("defs");
const avatarClip = defs
  .append("clipPath")
  .attr("id", "avatar-clip");

avatarClip.append("circle").attr("class", "avatar-clip-circle");

const viewport = svg.append("g").attr("class", "viewport");
const stage = viewport.append("g").attr("class", "stage");
const linksLayer = stage.append("g").attr("class", "links");
const nodesLayer = stage.append("g").attr("class", "nodes");
const detailLinksLayer = stage.append("g").attr("class", "detail-links");
const detailsLayer = stage.append("g").attr("class", "details");
const subDetailLinksLayer = stage.append("g").attr("class", "sub-detail-links");
const subDetailsLayer = stage.append("g").attr("class", "sub-details");

let expanded = false;
let rotationOffset = 0;
let selectedId = null;
let selectedDetailId = null;
let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;

const zoomBehavior = d3
  .zoom()
  .scaleExtent([0.45, 2.2])
  .on("zoom", (event) => {
    viewport.attr("transform", event.transform);
  });

svg.call(zoomBehavior);

function normalizeAngle(angle) {
  let value = angle % (Math.PI * 2);
  if (value > Math.PI) value -= Math.PI * 2;
  if (value < -Math.PI) value += Math.PI * 2;
  return value;
}

function nodesWithLayout() {
  return categories.map((item, index) => {
    const angle = -Math.PI / 2 + Math.PI / 4 + (index * Math.PI * 2) / categories.length + rotationOffset;
    const rotationDeg = ((angle - Math.PI / 4) * 180) / Math.PI;
    return {
      ...item,
      angle,
      rotationDeg,
      x: Math.cos(angle) * OUTER_RADIUS,
      y: Math.sin(angle) * OUTER_RADIUS,
    };
  });
}

function quarterCirclePath(innerRadius, outerRadius) {
  const p = d3.path();
  p.moveTo(innerRadius, 0);
  p.arc(0, 0, innerRadius, 0, Math.PI / 2);
  p.lineTo(0, outerRadius);
  p.arc(0, 0, outerRadius, Math.PI / 2, 0, true);
  p.closePath();
  return p.toString();
}

function labelArcPath(radius) {
  const start = 0.12;
  const end = Math.PI / 2 - 0.12;
  const p = d3.path();
  p.arc(0, 0, radius, start, end);
  return p.toString();
}

function setChildLabel(textSelection) {
  textSelection.each(function updateLabel(d) {
    const text = d3.select(this);
    text.selectAll("textPath").remove();
    text
      .append("textPath")
      .attr("href", `#child-label-arc-${d.id}`)
      .attr("startOffset", "50%")
      .text(d.label || "");
  });
}

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
  if (value.endsWith(".html")) {
    return `./${value}`;
  }
  return `https://${value}`;
}

function linkifyText(raw) {
  const escaped = escapeHtml(raw);
  return escaped.replace(
    /((?:https?:\/\/|www\.)[^\s<]+|(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}(?:\/[^\s<]*)?|[A-Za-z0-9_./-]+\.html)/g,
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

function renderSubDetailHtml(detail) {
  const title = escapeHtml(detail.title || "Details");
  const bullets = (detail.lines || [])
    .map((line) => `<li>${linkifyText(line)}</li>`)
    .join("");
  const image = detail.image
    ? `<img class="sub-detail-image" src="${escapeHtml(detail.image)}" alt="${escapeHtml(detail.imageAlt || detail.title || "detail image")}">`
    : "";
  return `<h4>${title}</h4>${image}<ul>${bullets}</ul>`;
}

function collapsedStarPosition(node) {
  const radius = MAIN_RADIUS + 8;
  return {
    x: Math.cos(node.angle) * radius,
    y: Math.sin(node.angle) * radius,
  };
}

function render() {
  const items = nodesWithLayout();
  const t = d3.transition().duration(650).ease(d3.easeCubicOut);
  const projectedItems = items.map((item) => ({
    ...item,
    px: item.x * EDGE_LENGTH_FACTOR,
    py: item.y * EDGE_LENGTH_FACTOR,
  }));
  const selectedNode = projectedItems.find((item) => item.id === selectedId);
  const selectedHighlights =
    expanded && selectedNode ? highlightsByCategory[selectedNode.id] || [] : [];
  const detailAnchorRadius = (CHILD_QUARTER_INNER_RADIUS + CHILD_QUARTER_OUTER_RADIUS) / 2;
  const detailEdgeAnchorRadius = CHILD_QUARTER_OUTER_RADIUS;
  const detailAnchorX = selectedNode
    ? selectedNode.px + Math.cos(selectedNode.angle) * detailAnchorRadius
    : 0;
  const detailAnchorY = selectedNode
    ? selectedNode.py + Math.sin(selectedNode.angle) * detailAnchorRadius
    : 0;
  const detailEdgeAnchorX = selectedNode
    ? selectedNode.px + Math.cos(selectedNode.angle) * detailEdgeAnchorRadius
    : 0;
  const detailEdgeAnchorY = selectedNode
    ? selectedNode.py + Math.sin(selectedNode.angle) * detailEdgeAnchorRadius
    : 0;
  const detailStackTopY = detailAnchorY - DETAIL_CARD_HEIGHT / 2;
  const details = selectedHighlights.map((item, index) => ({
    ...item,
    categoryId: selectedNode.id,
    parentColor: selectedNode.color,
    x: selectedNode.px + CHILD_QUARTER_OUTER_RADIUS + DETAIL_OFFSET_X,
    y: detailStackTopY + index * (DETAIL_CARD_HEIGHT + DETAIL_CARD_GAP),
  }));
  const selectedDetail = details.find((item) => item.id === selectedDetailId) || null;
  const leftExtent = Math.min(
    -MAIN_RADIUS,
    ...(expanded ? projectedItems.map((item) => item.px - CHILD_QUARTER_OUTER_RADIUS) : [0])
  );
  const topExtent = Math.min(
    -MAIN_RADIUS,
    ...(expanded ? projectedItems.map((item) => item.py - CHILD_QUARTER_OUTER_RADIUS) : [0])
  );
  const minVisibleStageX = 36 - leftExtent;
  const minVisibleStageY = 32 - topExtent;
  const desiredTopLeftStageX = 84;
  const desiredTopLeftStageY = 92;
  const stageX =
    expanded && selectedId
      ? Math.max(desiredTopLeftStageX, minVisibleStageX)
      : width / 2;
  const stageY =
    expanded && selectedId
      ? Math.max(desiredTopLeftStageY, minVisibleStageY)
      : centerY;

  avatarClip.select(".avatar-clip-circle").attr("r", MAIN_RADIUS);

  stage.transition(t).attr("transform", `translate(${stageX}, ${stageY})`);

  const main = nodesLayer.selectAll(".main-node").data([{}]);
  const mainEnter = main
    .enter()
    .append("g")
    .attr("class", "main-node")
    .attr("tabindex", 0)
    .style("cursor", "pointer")
    .on("click", () => {
      expanded = !expanded;
      if (!expanded) {
        selectedId = null;
        selectedDetailId = null;
      }
      render();
    })
    .on("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        expanded = !expanded;
        if (!expanded) {
          selectedId = null;
          selectedDetailId = null;
        }
        render();
      }
    });

  mainEnter
    .append("image")
    .attr("class", "main-avatar")
    .attr("href", "./avatar.jpeg")
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("clip-path", "url(#avatar-clip)");
  mainEnter
    .append("circle")
    .attr("r", MAIN_RADIUS)
    .attr("class", "main-circle");

  main
    .merge(mainEnter)
    .select(".main-avatar")
    .attr("x", -MAIN_RADIUS)
    .attr("y", -MAIN_RADIUS)
    .attr("width", MAIN_RADIUS * 2)
    .attr("height", MAIN_RADIUS * 2);

  const links = linksLayer.selectAll(".link").data(projectedItems, (d) => d.id);

  links
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0)
    .style("opacity", 0)
    .merge(links)
    .transition(t)
    .attr("x2", (d) => (expanded ? d.px + Math.cos(d.angle) * CHILD_QUARTER_INNER_RADIUS : 0))
    .attr("y2", (d) => (expanded ? d.py + Math.sin(d.angle) * CHILD_QUARTER_INNER_RADIUS : 0))
    .style("opacity", expanded ? 0.85 : 0);

  const childNodes = nodesLayer.selectAll(".child-node").data(projectedItems, (d) => d.id);

  const childEnter = childNodes
    .enter()
    .append("g")
    .attr("class", "child-node")
    .attr("transform", "translate(0,0)")
    .style("opacity", 0)
    .on("click", (_event, d) => {
      const delta = normalizeAngle(0 - d.angle);
      rotationOffset += delta;
      selectedId = d.id;
      selectedDetailId = null;
      render();
    });

  childEnter
    .append("path")
    .attr("class", "child-wedge")
    .attr("d", quarterCirclePath(CHILD_QUARTER_INNER_RADIUS, CHILD_QUARTER_OUTER_RADIUS))
    .attr("fill", (d) => d.color);
  childEnter
    .append("path")
    .attr("class", "child-label-arc")
    .attr("id", (d) => `child-label-arc-${d.id}`)
    .attr("d", labelArcPath((CHILD_QUARTER_INNER_RADIUS + CHILD_QUARTER_OUTER_RADIUS) / 2));
  childEnter
    .append("text")
    .attr("class", "child-label")
    .call(setChildLabel);

  const childMerge = childEnter
    .merge(childNodes)
    .style("pointer-events", expanded ? "all" : "none")
    .classed("is-selected", (d) => d.id === selectedId);

  childMerge
    .transition(t)
    .attr(
      "transform",
      (d) => {
        const collapsed = collapsedStarPosition(d);
        const x = expanded ? d.px : collapsed.x;
        const y = expanded ? d.py : collapsed.y;
        return `translate(${x},${y}) rotate(${d.rotationDeg})`;
      }
    )
    .style("opacity", expanded ? 1 : 0);

  childMerge
    .select(".child-label")
    .call(setChildLabel);

  const detailEdges = [];

  if (details.length > 0) {
    detailEdges.push({
      id: `selected-to-${details[0].id}`,
      x1: detailEdgeAnchorX,
      y1: detailEdgeAnchorY,
      x2: details[0].x,
      y2: details[0].y + DETAIL_CARD_HEIGHT / 2,
    });

    for (let i = 1; i < details.length; i += 1) {
      const prev = details[i - 1];
      const curr = details[i];
      detailEdges.push({
        id: `${prev.id}-to-${curr.id}`,
        x1: prev.x + DETAIL_CARD_WIDTH / 2,
        y1: prev.y + DETAIL_CARD_HEIGHT,
        x2: curr.x + DETAIL_CARD_WIDTH / 2,
        y2: curr.y,
      });
    }
  }

  const detailLinks = detailLinksLayer.selectAll(".detail-link").data(detailEdges, (d) => d.id);
  detailLinks
    .enter()
    .append("line")
    .attr("class", "detail-link")
    .attr("x1", selectedNode ? selectedNode.px : 0)
    .attr("y1", selectedNode ? selectedNode.py : 0)
    .attr("x2", selectedNode ? selectedNode.px : 0)
    .attr("y2", selectedNode ? selectedNode.py : 0)
    .style("opacity", 0)
    .merge(detailLinks)
    .transition(t)
    .attr("x1", (d) => d.x1)
    .attr("y1", (d) => d.y1)
    .attr("x2", (d) => d.x2)
    .attr("y2", (d) => d.y2)
    .style("opacity", 0.9);

  detailLinks
    .exit()
    .transition(t)
    .style("opacity", 0)
    .remove();

  const detailNodes = detailsLayer.selectAll(".detail-card").data(details, (d) => d.id);
  const detailEnter = detailNodes
    .enter()
    .append("g")
    .attr("class", "detail-card")
    .attr("transform", selectedNode ? `translate(${selectedNode.px},${selectedNode.py})` : "translate(0,0)")
    .style("opacity", 0);

  detailEnter
    .append("rect")
    .attr("rx", 18)
    .attr("ry", 18)
    .attr("width", DETAIL_CARD_WIDTH)
    .attr("height", DETAIL_CARD_HEIGHT);
  detailEnter.append("text").attr("class", "detail-title").attr("x", 16).attr("y", 40).text((d) => d.title);
  detailEnter.append("text").attr("class", "detail-meta").attr("x", 16).attr("y", 76).text((d) => d.meta);

  const detailMerge = detailEnter
    .merge(detailNodes)
    .style("cursor", "pointer")
    .on("click", (_event, d) => {
      selectedDetailId = selectedDetailId === d.id ? null : d.id;
      render();
    })
    .classed("is-selected", (d) => d.id === selectedDetailId);

  detailMerge
    .select("rect")
    .attr("fill", (d) => d.parentColor || "rgba(255, 255, 255, 0.9)");

  detailMerge
    .select(".detail-title")
    .attr("y", (d) => (d.meta ? 40 : 62));

  detailMerge
    .select(".detail-meta")
    .text((d) => d.meta || "")
    .attr("display", (d) => (d.meta ? null : "none"));

  detailMerge
    .transition(t)
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .style("opacity", 1);

  detailNodes
    .exit()
    .transition(t)
    .attr("transform", selectedNode ? `translate(${selectedNode.px},${selectedNode.py})` : "translate(0,0)")
    .style("opacity", 0)
    .remove();

  const subDetails = selectedDetail
    ? [
        {
          id: `sub-${selectedDetail.id}`,
          x: selectedDetail.x + DETAIL_CARD_WIDTH + SUB_DETAIL_OFFSET_X,
          y: selectedDetail.y - (SUB_DETAIL_HEIGHT - DETAIL_CARD_HEIGHT) / 2,
          width: Math.max(
            SUB_DETAIL_MIN_WIDTH,
            width - stageX - (selectedDetail.x + DETAIL_CARD_WIDTH + SUB_DETAIL_OFFSET_X) - 24
          ),
          ...deepDetailsByHighlight[selectedDetail.id],
        },
      ]
    : [];

  const subDetailEdges = selectedDetail
    ? [
        {
          id: `detail-to-sub-${selectedDetail.id}`,
          x1: selectedDetail.x + DETAIL_CARD_WIDTH,
          y1: selectedDetail.y + DETAIL_CARD_HEIGHT / 2,
          x2: selectedDetail.x + DETAIL_CARD_WIDTH + SUB_DETAIL_OFFSET_X,
          y2: selectedDetail.y + DETAIL_CARD_HEIGHT / 2,
        },
      ]
    : [];

  const subDetailLinks = subDetailLinksLayer
    .selectAll(".sub-detail-link")
    .data(subDetailEdges, (d) => d.id);
  subDetailLinks
    .enter()
    .append("line")
    .attr("class", "sub-detail-link")
    .attr("x1", selectedDetail ? selectedDetail.x + DETAIL_CARD_WIDTH : 0)
    .attr("y1", selectedDetail ? selectedDetail.y + DETAIL_CARD_HEIGHT / 2 : 0)
    .attr("x2", selectedDetail ? selectedDetail.x + DETAIL_CARD_WIDTH : 0)
    .attr("y2", selectedDetail ? selectedDetail.y + DETAIL_CARD_HEIGHT / 2 : 0)
    .style("opacity", 0)
    .merge(subDetailLinks)
    .transition(t)
    .attr("x1", (d) => d.x1)
    .attr("y1", (d) => d.y1)
    .attr("x2", (d) => d.x2)
    .attr("y2", (d) => d.y2)
    .style("opacity", 0.9);

  subDetailLinks
    .exit()
    .transition(t)
    .style("opacity", 0)
    .remove();

  const subDetailNodes = subDetailsLayer.selectAll(".sub-detail-card").data(subDetails, (d) => d.id);
  const subEnter = subDetailNodes
    .enter()
    .append("g")
    .attr("class", "sub-detail-card")
    .attr("transform", selectedDetail ? `translate(${selectedDetail.x},${selectedDetail.y})` : "translate(0,0)")
    .style("opacity", 0);

  subEnter
    .append("rect")
    .attr("rx", 16)
    .attr("ry", 16)
    .attr("width", (d) => d.width)
    .attr("height", SUB_DETAIL_HEIGHT);
  const foEnter = subEnter
    .append("foreignObject")
    .attr("class", "sub-detail-fo")
    .attr("x", 12)
    .attr("y", 12)
    .attr("height", SUB_DETAIL_HEIGHT - 24)
    .attr("width", (d) => d.width - 24);

  foEnter.append("xhtml:div").attr("class", "sub-detail-content");

  subEnter
    .merge(subDetailNodes)
    .each(function updateSubDetailCard(d) {
      const card = d3.select(this);
      card.select("rect").attr("width", d.width);
      card.select(".sub-detail-fo").attr("width", d.width - 24);
      card
        .select(".sub-detail-content")
        .html(renderSubDetailHtml(d));
    })
    .transition(t)
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .style("opacity", 1);

  subDetailNodes
    .exit()
    .transition(t)
    .attr("transform", selectedDetail ? `translate(${selectedDetail.x},${selectedDetail.y})` : "translate(0,0)")
    .style("opacity", 0)
    .remove();
}

function resize() {
  width = app.node().clientWidth;
  height = app.node().clientHeight;
  centerX = width / 2;
  centerY = height / 2;

  svg.attr("viewBox", `0 0 ${width} ${height}`);
  stage.attr("transform", `translate(${centerX}, ${centerY})`);
  render();
}

window.addEventListener("resize", resize);
resize();
