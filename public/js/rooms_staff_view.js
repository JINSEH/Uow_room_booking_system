const roomsGrid = document.getElementById("rooms-grid");
const roomsStatus = document.getElementById("rooms-status");
const roomTypeFilter = document.getElementById("room-type-filter");
const roomStatusFilter = document.getElementById("room-status-filter");
const welcomeMessage = document.getElementById("welcome-message");
const prevButton = document.getElementById("rooms-prev");
const nextButton = document.getElementById("rooms-next");
const pageInfo = document.getElementById("page-info");
const logoutButton = document.getElementById("logout-button");

const roomsPerPage = 6;
let currentPage = 1;
let allStaffRooms = [];

function formatPrice(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatText(value, fallback = "Not set") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function createRoomCard(room) {
  const article = document.createElement("article");
  article.className = "room-card";
  article.setAttribute("role", "listitem");

  article.innerHTML = `
    <h3>${room.name}</h3>
    <p><strong>Capacity:</strong> ${formatText(room.capacity)}</p>
    <p><strong>Price:</strong> ${formatPrice(room.price)}</p>
    <p><strong>Date:</strong> ${formatText(room.date)}</p>
    <p><strong>Time:</strong> ${formatText(room.start_time)} - ${formatText(room.end_time)}</p>
    <span class="room-status ${room.status}">${room.status}</span>
  `;

  return article;
}

function getFilteredRooms() {
  const selectedType = roomTypeFilter?.value || "all";
  const selectedStatus = roomStatusFilter?.value || "all";

  return allStaffRooms.filter((room) => {
    const typeMatches = selectedType === "all" || room.name === selectedType;
    const statusMatches = selectedStatus === "all" || room.status === selectedStatus;
    return typeMatches && statusMatches;
  });
}

function renderCurrentPage() {
  if (!roomsGrid || !roomsStatus || !pageInfo || !prevButton || !nextButton) return;

  const filteredRooms = getFilteredRooms();

  if (filteredRooms.length === 0) {
    roomsGrid.innerHTML = "";
    roomsStatus.textContent = "No rooms match your selected filters.";
    currentPage = 1;
    pageInfo.textContent = "Page 1 of 1";
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * roomsPerPage;
  const visibleRooms = filteredRooms.slice(start, start + roomsPerPage);

  roomsGrid.innerHTML = "";
  visibleRooms.forEach((room) => {
    roomsGrid.appendChild(createRoomCard(room));
  });

  roomsStatus.textContent = `${filteredRooms.length} room(s) found.`;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
}

function attachFilterEvents() {
  if (roomTypeFilter) {
    roomTypeFilter.addEventListener("change", () => {
      currentPage = 1;
      renderCurrentPage();
    });
  }

  if (roomStatusFilter) {
    roomStatusFilter.addEventListener("change", () => {
      currentPage = 1;
      renderCurrentPage();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      currentPage -= 1;
      renderCurrentPage();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      currentPage += 1;
      renderCurrentPage();
    });
  }
}

async function updateWelcomeText() {
  const token = localStorage.getItem("token");
  if (!token || !welcomeMessage) {
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      welcomeMessage.textContent = "Welcome to the UOW Room Booking System, Staff!";
      return;
    }

    const user = await response.json();
    const staffName = user?.name?.trim();
    if (staffName) {
      welcomeMessage.textContent = `Welcome to the UOW Room Booking System, ${staffName}!`;
      return;
    }
  } catch (error) {
    // Use fallback text if the profile request fails.
  }

  welcomeMessage.textContent = "Welcome to the UOW Room Booking System, Staff!";
}

async function fetchStaffRooms() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/html/index.html";
    return;
  }

  if (!roomsStatus) return;
  roomsStatus.textContent = "Loading rooms...";

  try {
    // Launched rooms are public in existing API.
    const launchedRequest = fetch("/api/rooms/launched");
    // Draft rooms are protected and now scoped to logged-in staff.
    const draftRequest = fetch("/api/rooms/draft", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const [launchedResponse, draftResponse] = await Promise.all([launchedRequest, draftRequest]);

    if (!launchedResponse.ok || !draftResponse.ok) {
      roomsStatus.textContent = "Unable to load rooms. Please try again.";
      return;
    }

    const launchedRooms = await launchedResponse.json();
    const draftRooms = await draftResponse.json();

    const safeLaunched = Array.isArray(launchedRooms) ? launchedRooms : [];
    const safeDraft = Array.isArray(draftRooms) ? draftRooms : [];

    allStaffRooms = [...safeLaunched, ...safeDraft];
    currentPage = 1;
    renderCurrentPage();
  } catch (error) {
    roomsStatus.textContent = "Network error while loading rooms.";
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/html/index.html";
  });
}

attachFilterEvents();
updateWelcomeText();
fetchStaffRooms();
