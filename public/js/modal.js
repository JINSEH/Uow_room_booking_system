const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const openLoginButtons = document.querySelectorAll("[data-open-login]");
const openRegisterButtons = document.querySelectorAll("[data-open-register]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const allModals = [loginModal, registerModal].filter(Boolean);
const loginForm = loginModal?.querySelector(".modal-form");
const loginError = document.getElementById("login-error");
const registerForm = registerModal?.querySelector(".modal-form");
const registerRoleInput = document.getElementById("register-role");
const registerRoleCheckboxes = document.querySelectorAll("[data-role-checkbox]");
const registerRoleError = document.getElementById("register-role-error");

function openModal(modalToOpen) {
  if (!modalToOpen) return;

  allModals.forEach((modal) => {
    const isTargetModal = modal === modalToOpen;
    modal.classList.toggle("is-open", isTargetModal);
    modal.setAttribute("aria-hidden", String(!isTargetModal));
  });

  document.body.classList.add("modal-open");
}

function closeAllModals() {
  allModals.forEach((modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });

  document.body.classList.remove("modal-open");
}

openLoginButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openModal(loginModal);
  });
});

openRegisterButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openModal(registerModal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeAllModals);
});

allModals.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAllModals();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllModals();
  }
});

//Login functionality
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    if (loginError) {
      loginError.textContent = "";
    }

    const formData = new FormData(loginForm);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error || "Login failed. Please try again.";
        if (loginError) {
          loginError.textContent = errorMessage;
        }
        return;
      }

      const responseBody = await response.json();
      localStorage.setItem("token", responseBody.token);
      localStorage.setItem("role", responseBody.role);

      if (responseBody.role === "staff") {
        window.location.href = "/html/rooms_staff_view.html";
        return;
      }

      if (responseBody.role === "student") {
        window.location.href = "/html/rooms_student_view.html";
        return;
      }

      if (loginError) {
        loginError.textContent = "Login succeeded, but role is invalid.";
      }
    } catch (error) {
      if (loginError) {
        loginError.textContent = "Network error. Please try again.";
      }
    }
  });
}

registerRoleCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      registerRoleCheckboxes.forEach((otherCheckbox) => {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.checked = false;
        }
      });

      if (registerRoleInput) {
        registerRoleInput.value = checkbox.value;
      }
      if (registerRoleError) {
        registerRoleError.textContent = "";
      }
      return;
    }

    const selectedCheckbox = Array.from(registerRoleCheckboxes).find(
      (roleCheckbox) => roleCheckbox.checked,
    );
    if (registerRoleInput) {
      registerRoleInput.value = selectedCheckbox ? selectedCheckbox.value : "";
    }
    if (registerRoleInput?.value && registerRoleError) {
      registerRoleError.textContent = "";
    }
  });
});

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!registerForm.checkValidity()) {
      registerForm.reportValidity();
      return;
    }

    if (registerRoleInput && !registerRoleInput.value) {
      if (registerRoleError) {
        registerRoleError.textContent = "Please choose a role: Staff or Student.";
      }
      return;
    }

    const formData = new FormData(registerForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    try {
      const response = await fetch("/api/auth/registerUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error || "Registration failed. Please try again.";
        if (registerRoleError) {
          registerRoleError.textContent = errorMessage;
        }
        return;
      }

      registerForm.reset();
      if (registerRoleInput) {
        registerRoleInput.value = "";
      }
      registerRoleCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      if (registerRoleError) {
        registerRoleError.textContent = "";
      }

      alert("Registration successful. You can now log in.");
      openModal(loginModal);
    } catch (error) {
      if (registerRoleError) {
        registerRoleError.textContent = "Network error. Please try again.";
      }
    }
  });
}



