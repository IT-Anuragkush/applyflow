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

function formatJoinDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/* ---------------- Load Profile + Stats ---------------- */

async function getProfile() {
  try {
    showLoader();

    const response = await fetch("/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("name").innerText = data.user.name;
      document.getElementById("email").innerText = data.user.email;

      document.getElementById("displayName").innerText = data.user.name;
      document.getElementById("displayEmail").innerText = data.user.email;

      document.getElementById("memberSince").innerText = formatJoinDate(
        data.user.createdAt
      );

      // Avatar First Letter
      document.querySelector(".avatar").innerText = data.user.name
        .charAt(0)
        .toUpperCase();
    }

    const statsResponse = await fetch("/api/jobs/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const statsData = await statsResponse.json();

    if (statsData.success) {
      document.getElementById("totalApplications").innerText =
        statsData.stats.total;
    }
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}

/* ---------------- Edit Profile Modal ---------------- */

const editModalOverlay = document.getElementById("editModalOverlay");
const editProfileForm = document.getElementById("editProfileForm");

document.getElementById("editBtn").addEventListener("click", () => {
  document.getElementById("editName").value =
    document.getElementById("name").innerText;
  document.getElementById("editEmail").value =
    document.getElementById("email").innerText;

  editModalOverlay.classList.add("active");
});

function closeEditModal() {
  editModalOverlay.classList.remove("active");
}

document
  .getElementById("closeEditModalBtn")
  .addEventListener("click", closeEditModal);
document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);

editModalOverlay.addEventListener("click", (e) => {
  if (e.target === editModalOverlay) closeEditModal();
});

editProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newName = document.getElementById("editName").value.trim();
  const newEmail = document.getElementById("editEmail").value.trim();

  if (!newName || !newEmail) {
    showToast("⚠️ Name and Email Are Required", "#ef4444");
    return;
  }

  try {
    showLoader();

    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✅ Profile Updated Successfully");
      closeEditModal();
      getProfile();
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

/* ---------------- Change Password Modal ---------------- */

const passwordModalOverlay = document.getElementById("passwordModalOverlay");
const changePasswordForm = document.getElementById("changePasswordForm");

document.getElementById("changePasswordBtn").addEventListener("click", () => {
  changePasswordForm.reset();
  passwordModalOverlay.classList.add("active");
});

function closePasswordModal() {
  passwordModalOverlay.classList.remove("active");
  changePasswordForm.reset();
}

document
  .getElementById("closePasswordModalBtn")
  .addEventListener("click", closePasswordModal);
document
  .getElementById("cancelPasswordBtn")
  .addEventListener("click", closePasswordModal);

passwordModalOverlay.addEventListener("click", (e) => {
  if (e.target === passwordModalOverlay) closePasswordModal();
});

changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!oldPassword || !newPassword || !confirmPassword) {
    showToast("⚠️ All Fields Are Required", "#ef4444");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("⚠️ New Passwords Do Not Match", "#ef4444");
    return;
  }

  try {
    showLoader();

    const response = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("✅ Password Changed Successfully");
      closePasswordModal();
    } else {
      showToast(data.message || "❌ Password Change Failed", "#ef4444");
    }
  } catch (error) {
    console.error(error);
    showToast("❌ Password Change Failed", "#ef4444");
  } finally {
    hideLoader();
  }
});

/* ---------------- Delete Account ---------------- */

document
  .getElementById("deleteAccountBtn")
  .addEventListener("click", async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      showLoader();

      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Account Deleted Successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        localStorage.removeItem("token");
        window.location.href = "/register";
      } else {
        Swal.fire({
          icon: "error",
          title: data.message,
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Something went wrong",
      });
    } finally {
      hideLoader();
    }
  });

window.addEventListener("DOMContentLoaded", () => {
  getProfile();
});

// logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const result = await Swal.fire({
    title: "Logout?",
    text: "You will need to login again.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    localStorage.removeItem("token");

    await Swal.fire({
      icon: "success",
      title: "Logged Out Successfully",
      timer: 1000,
      showConfirmButton: false,
    });

    window.location.href = "/login";
  }
});