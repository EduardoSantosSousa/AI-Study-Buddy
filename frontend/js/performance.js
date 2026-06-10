document.addEventListener("DOMContentLoaded", async () => {
  try {
    const summary = await getAnalyticsSummary();

    setText("totalQuizzes", summary.total_quizzes);
    setText("averageScore", `${summary.average_score}%`);
    setText("bestScore", `${summary.best_score}%`);
    setText("favoriteTopic", summary.favorite_topic || "N/A");

    const exportLink = document.getElementById("exportAllDataLink");
    if (exportLink) {
      exportLink.href = getAllExportUrl();
      exportLink.download = "study_buddy_sessions.csv";
    }

    renderHistoryTable(summary.sessions || []);
    setText("sessionsSummaryText", buildSessionsSummary(summary.sessions || []));
    renderScoreTrendChart(summary.sessions || []);
  } catch (error) {
    console.error(error);
  }
});

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function renderHistoryTable(sessions) {
  const tbody = document.getElementById("historyTableBody");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!sessions.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-8 py-5 text-on-surface-variant" colspan="5">
        No study sessions found yet.
      </td>
    `;
    tbody.appendChild(tr);
    return;
  }

  sessions.forEach((session) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-surface-container transition-colors group";

    tr.innerHTML = `
      <td class="px-8 py-5">
        <div class="flex flex-col">
          <span class="text-on-surface font-semibold">${formatDate(session.created_at)}</span>
          <span class="text-on-surface-variant text-xs">${formatTime(session.created_at)}</span>
        </div>
      </td>
      <td class="px-8 py-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-sm">quiz</span>
          </div>
          <span class="text-on-surface font-medium">${session.topic}</span>
        </div>
      </td>
      <td class="px-8 py-5 text-center">
        <span class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold uppercase">${session.difficulty}</span>
      </td>
      <td class="px-8 py-5 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-secondary text-secondary font-bold text-sm bg-secondary-container bg-opacity-5">
          ${session.score_percentage}%
        </div>
      </td>
      <td class="px-8 py-5 text-right">
        <a class="text-primary font-label-md text-label-md hover:underline" href="${getSessionExportUrl(session.session_id)}" download>
          CSV
        </a>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function renderScoreTrendChart(sessions) {
  const line = document.getElementById("scoreTrendLine");
  const area = document.getElementById("scoreTrendArea");
  const pointsGroup = document.getElementById("scoreTrendPoints");
  const labels = document.getElementById("scoreTrendLabels");

  if (!line || !area || !pointsGroup || !labels) {
    return;
  }

  pointsGroup.innerHTML = "";
  labels.innerHTML = "";

  const chronologicalSessions = [...sessions]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-10);

  if (!chronologicalSessions.length) {
    line.setAttribute("d", "");
    area.setAttribute("d", "");
    labels.innerHTML = '<span>No score data yet</span>';
    return;
  }

  const chartWidth = 1000;
  const chartHeight = 200;
  const paddingX = chronologicalSessions.length === 1 ? chartWidth / 2 : 0;
  const usableWidth = chronologicalSessions.length === 1 ? 0 : chartWidth;

  const points = chronologicalSessions.map((session, index) => {
    const x = chronologicalSessions.length === 1
      ? paddingX
      : (index / (chronologicalSessions.length - 1)) * usableWidth;
    const score = Number(session.score_percentage) || 0;
    const y = chartHeight - (Math.max(0, Math.min(score, 100)) / 100) * chartHeight;

    return { x, y, score, createdAt: session.created_at };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L${points[points.length - 1].x} ${chartHeight} L${points[0].x} ${chartHeight} Z`;

  line.setAttribute("d", linePath);
  area.setAttribute("d", areaPath);

  points.forEach((point) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", "#1f108e");
    circle.setAttribute("stroke", "white");
    circle.setAttribute("stroke-width", "2");

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${formatDate(point.createdAt)} - ${point.score}%`;
    circle.appendChild(title);
    pointsGroup.appendChild(circle);
  });

  labels.innerHTML = buildChartLabels(points);
}

function buildChartLabels(points) {
  if (points.length === 1) {
    return `<span>${formatDate(points[0].createdAt)}</span>`;
  }

  const first = points[0];
  const middle = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];

  return `
    <span>${formatDate(first.createdAt)}</span>
    <span>${formatDate(middle.createdAt)}</span>
    <span>${formatDate(last.createdAt)}</span>
  `;
}

function buildSessionsSummary(sessions) {
  if (!sessions.length) {
    return "No completed study sessions yet";
  }

  return `Showing ${sessions.length} of ${sessions.length} study sessions`;
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString();
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
