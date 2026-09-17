const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login";
}

let statusChart = null;
let currentJobs = [];

function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showToast(message, color = "#22c55e") {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    style: {
      background: color,
      borderRadius: "10px",
    },
  }).showToast();
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

function formatSalary(salary) {
  if (!salary && salary !== 0) return "Not specified";
  return "₹" + Number(salary).toLocaleString("en-IN") + " / yr";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ---------------- Add Job ---------------- */

const form = document.getElementById("jobForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const companyName = document.getElementById("companyName").value.trim();
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const location = document.getElementById("location").value.trim();
  const salary = document.getElementById("salary").value;
  const jobLink = document.getElementById("jobLink").value.trim();
  const status = document.getElementById("status").value;
  const priority = document.getElementById("priority").value;
  const notes = document.getElementById("notes").value.trim();

  if (!companyName || !jobTitle) {
    showToast("⚠️ Company Name and Job Title Are Required", "#ef4444");
    return;
  }

  try {
    showLoader();

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        companyName,
        jobTitle,
        location,
        salary: salary ? Number(salary) : undefined,
        jobLink,
        status,
        priority,
        notes,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✅ Job Added Successfully");
      form.reset();
      document.getElementById("priority").value = "Medium";
      getJobs();
      getStats();
    } else {
      showToast(data.message || "❌ Something Went Wrong", "#ef4444");
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Something Went Wrong", "#ef4444");
  } finally {
    hideLoader();
  }
});

document.getElementById("searchBtn").addEventListener("click", getJobs);
document.getElementById("filterStatus").addEventListener("change", getJobs);
document.getElementById("sort").addEventListener("change", getJobs);

document.getElementById("search").addEventListener("keyup", (e) => {
  if (e.key === "Enter") getJobs();
});

/* ---------------- Fetch + Render Jobs ---------------- */

async function getJobs() {
  try {
    showLoader();

    const search = document.getElementById("search").value;
    const status = document.getElementById("filterStatus").value;
    const sort = document.getElementById("sort").value;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);

    const response = await fetch(`/api/jobs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    const jobsContainer = document.getElementById("jobsContainer");
    jobsContainer.innerHTML = "";

    currentJobs = data.jobs || [];

    if (currentJobs.length === 0) {
      jobsContainer.innerHTML = `
        <div class="empty-state">
          <h2>No Jobs Found</h2>
          <p>Add your first job application using the form above.</p>
        </div>
      `;
      return;
    }

    currentJobs.forEach((job) => {
      const priorityClass = `priority-${(job.priority || "Medium").toLowerCase()}`;
      const linkHtml = job.jobLink
        ? `<a class="job-link-btn" href="${escapeHtml(job.jobLink)}" target="_blank" rel="noopener">🔗 View Posting</a>`
        : "";
      const notesHtml = job.notes
        ? `<div class="job-notes">${escapeHtml(job.notes)}</div>`
        : "";

      jobsContainer.innerHTML += `
        <div class="job-card">
          <div class="job-card-header">
            <h3>${escapeHtml(job.companyName)}</h3>
            <span class="status ${job.status.toLowerCase()}">${job.status}</span>
          </div>

          <p class="job-title">${escapeHtml(job.jobTitle)}</p>

          <span class="priority-badge ${priorityClass}">Priority: ${job.priority || "Medium"}</span>

          <div class="job-meta">
            ${job.location ? `<span>📍 ${escapeHtml(job.location)}</span>` : ""}
            <span>💰 ${formatSalary(job.salary)}</span>
            <span>🗓️ Added ${formatDate(job.createdAt)}</span>
          </div>

          ${notesHtml}
          ${linkHtml}

          <div class="job-card-actions">
            <button class="edit-btn" onclick="openEditModalById('${job._id}')">Edit</button>
            <button class="delete-btn" onclick="deleteJob('${job._id}')">Delete</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}

/* ---------------- Stats + Chart ---------------- */

async function getStats() {
  try {
    const response = await fetch("/api/jobs/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) return;

    document.getElementById("miniTotal").innerText = data.stats.total;
    document.getElementById("miniApplied").innerText = data.stats.applied;
    document.getElementById("miniInterview").innerText = data.stats.interview;
    document.getElementById("miniOffer").innerText = data.stats.offer;
    document.getElementById("miniRejected").innerText = data.stats.rejected;

    renderChart(data.stats);
  } catch (error) {
    console.error(error);
  }
}

function renderChart(stats) {
  const ctx = document.getElementById("miniChart");

  const chartData = {
    labels: ["Applied", "Interview", "Offer", "Rejected"],
    datasets: [
      {
        data: [stats.applied, stats.interview, stats.offer, stats.rejected],
        backgroundColor: ["#2563eb", "#f59e0b", "#10b981", "#ef4444"],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  if (statusChart) {
    statusChart.data = chartData;
    statusChart.update();
    return;
  }

  statusChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
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

/* ---------------- Delete ---------------- */

async function deleteJob(id) {
  const result = await Swal.fire({
    title: "Delete this application?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, delete it",
  });

  if (!result.isConfirmed) return;

  try {
    showLoader();

    const response = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      showToast("🗑️ Job Deleted", "#ef4444");
      getJobs();
      getStats();
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Delete Failed", "#ef4444");
  } finally {
    hideLoader();
  }
}

/* ---------------- Edit Modal ---------------- */

const editModalOverlay = document.getElementById("editModalOverlay");
const editJobForm = document.getElementById("editJobForm");

function openEditModalById(id) {
  const job = currentJobs.find((j) => j._id === id);
  if (!job) return;
  openEditModal(job);
}

function openEditModal(job) {
  document.getElementById("editJobId").value = job._id;
  document.getElementById("editCompanyName").value = job.companyName || "";
  document.getElementById("editJobTitle").value = job.jobTitle || "";
  document.getElementById("editLocation").value = job.location || "";
  document.getElementById("editSalary").value = job.salary || "";
  document.getElementById("editJobLink").value = job.jobLink || "";
  document.getElementById("editStatus").value = job.status || "Applied";
  document.getElementById("editPriority").value = job.priority || "Medium";
  document.getElementById("editNotes").value = job.notes || "";

  editModalOverlay.classList.add("active");
}

function closeEditModal() {
  editModalOverlay.classList.remove("active");
  editJobForm.reset();
}

document.getElementById("closeModalBtn").addEventListener("click", closeEditModal);
document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);

editModalOverlay.addEventListener("click", (e) => {
  if (e.target === editModalOverlay) closeEditModal();
});

editJobForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editJobId").value;
  const companyName = document.getElementById("editCompanyName").value.trim();
  const jobTitle = document.getElementById("editJobTitle").value.trim();
  const location = document.getElementById("editLocation").value.trim();
  const salary = document.getElementById("editSalary").value;
  const jobLink = document.getElementById("editJobLink").value.trim();
  const status = document.getElementById("editStatus").value;
  const priority = document.getElementById("editPriority").value;
  const notes = document.getElementById("editNotes").value.trim();

  if (!companyName || !jobTitle) {
    showToast("⚠️ Company Name and Job Title Are Required", "#ef4444");
    return;
  }

  try {
    showLoader();

    const response = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        companyName,
        jobTitle,
        location,
        salary: salary ? Number(salary) : undefined,
        jobLink,
        status,
        priority,
        notes,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✏️ Job Updated Successfully", "#f59e0b");
      closeEditModal();
      getJobs();
      getStats();
    } else {
      showToast(data.message || "❌ Update Failed", "#ef4444");
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Update Failed", "#ef4444");
  } finally {
    hideLoader();
  }
});

/* ---------------- Init ---------------- */

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const statusFromUrl = params.get("status");

  if (statusFromUrl) {
    const filterSelect = document.getElementById("filterStatus");
    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    if (validStatuses.includes(statusFromUrl)) {
      filterSelect.value = statusFromUrl;
    }
  }

  getJobs();
  getStats();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});