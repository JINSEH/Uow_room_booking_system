const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const openLoginButtons = document.querySelectorAll("[data-open-login]");
const openRegisterButtons = document.querySelectorAll("[data-open-register]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const allModals = [loginModal, registerModal].filter(Boolean);

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
