const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login";
}

function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getProfile() {
  const response = await fetch("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    document.getElementById(
      "welcome"
    ).innerText = `Welcome, ${data.user.name} 👋`;
  }
}

async function getStats() {
  const response = await fetch("/api/jobs/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    document.getElementById("total").innerText = data.stats.total;
    document.getElementById("applied").innerText = data.stats.applied;
    document.getElementById("interview").innerText = data.stats.interview;
    document.getElementById("offer").innerText = data.stats.offer;
    document.getElementById("rejected").innerText = data.stats.rejected;

    const ctx = document.getElementById("jobChart");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Applied", "Interview", "Offer", "Rejected"],
        datasets: [
          {
            data: [
              data.stats.applied,
              data.stats.interview,
              data.stats.offer,
              data.stats.rejected,
            ],
            backgroundColor: ["#2563eb", "#f59e0b", "#10b981", "#ef4444"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
}

/* Build a "last 6 months" trend chart + recent list from the full jobs list */
async function getJobsForTrendAndRecent() {
  const response = await fetch("/api/jobs?sort=newest", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.success) return;

  renderTrendChart(data.jobs);
  renderRecentList(data.jobs.slice(0, 5));
}

function renderTrendChart(jobs) {
  // Build labels for the last 6 months (oldest -> newest)
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      count: 0,
    });
  }

  jobs.forEach((job) => {
    if (!job.createdAt) return;
    const d = new Date(job.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  });

  const ctx = document.getElementById("trendChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Applications",
          data: months.map((m) => m.count),
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#4f46e5",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  });
}

function renderRecentList(jobs) {
  const container = document.getElementById("recentList");

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `<p class="recent-empty">No applications yet. Add your first job to see it here.</p>`;
    return;
  }

  container.innerHTML = jobs
    .map((job) => {
      const date = job.createdAt
        ? new Date(job.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })
        : "";

      return `
        <div class="recent-item">
          <div class="recent-item-main">
            <strong>${escapeHtml(job.companyName)}</strong>
            <span>${escapeHtml(job.jobTitle)}</span>
          </div>
          <div class="recent-item-meta">
            <span class="status ${job.status.toLowerCase()}">${job.status}</span>
            <span class="recent-date">${date}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

async function init() {
  try {
    showLoader();

    await getProfile();
    await getStats();
    await getJobsForTrendAndRecent();
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}

init();

const addJobBtn = document.getElementById("addJobBtn");

if (addJobBtn) {
  addJobBtn.addEventListener("click", () => {
    window.location.href = "/jobs";
  });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});