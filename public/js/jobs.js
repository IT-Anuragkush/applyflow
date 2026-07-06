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

const form = document.getElementById("jobForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const companyName = document.getElementById("companyName").value.trim();
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const status = document.getElementById("status").value;

  if (!companyName || !jobTitle) {
    showToast("⚠️ All Fields Are Required", "#ef4444");
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
        status,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✅ Job Added Successfully");
      form.reset();
      getJobs();
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

async function getJobs() {
  try {
    showLoader();

    const search = document.getElementById("search").value;
    const status = document.getElementById("filterStatus").value;
    const sort = document.getElementById("sort").value;

    let url = "/api/jobs?";

    if (search) url += `search=${search}&`;
    if (status) url += `status=${status}&`;
    if (sort) url += `sort=${sort}&`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    const jobsContainer = document.getElementById("jobsContainer");
    jobsContainer.innerHTML = "";

    if (data.jobs.length === 0) {
      jobsContainer.innerHTML = `
        <div class="empty-state">
          <h2>No Jobs Found</h2>
          <p>Add your first job application.</p>
        </div>
      `;
      return;
    }

    data.jobs.forEach((job) => {
      jobsContainer.innerHTML += `
        <div class="job-card">
          <div class="job-card-header">
            <h3>${job.companyName}</h3>
            <span class="status ${job.status.toLowerCase()}">${job.status}</span>
          </div>
          <p class="job-title">${job.jobTitle}</p>
          <div class="job-card-actions">
            <button class="edit-btn" onclick="editJob('${job._id}')">Edit</button>
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

async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;

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
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Delete Failed", "#ef4444");
  } finally {
    hideLoader();
  }
}

async function editJob(id) {
  const companyName = prompt("Enter Company Name");
  const jobTitle = prompt("Enter Job Title");
  const status = prompt("Enter Status (Applied/Interview/Offer/Rejected)");

  if (!companyName || !jobTitle || !status) return;

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
        status,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✏️ Job Updated Successfully", "#f59e0b");
      getJobs();
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Update Failed", "#ef4444");
  } finally {
    hideLoader();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  getJobs();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});
