const roomsCarousel = document.getElementById("rooms-carousel");
const roomsStatus = document.getElementById("rooms-status");
const welcomeMessage = document.getElementById("welcome-message");
const prevButton = document.getElementById("rooms-prev");
const nextButton = document.getElementById("rooms-next");
const logoutButton = document.getElementById("logout-button");
const navCreateRooms = document.getElementById("nav-create-rooms");
const bookingModal = document.getElementById("booking-modal");
const bookingModalClose = document.getElementById("booking-modal-close");
const bookingModalRoom = document.getElementById("booking-modal-room");
const bookingDateInput = document.getElementById("booking-date");
const bookingSlotsContainer = document.getElementById("booking-slots");
const bookingSummary = document.getElementById("booking-summary");
const bookingConfirmButton = document.getElementById("booking-confirm");
const bookingFeedback = document.getElementById("booking-feedback");
const updateRoomModal = document.getElementById("update-room-modal");
const updateRoomModalClose = document.getElementById("update-room-modal-close");
const updateRoomModalRoom = document.getElementById("update-room-modal-room");
const updateRoomPriceInput = document.getElementById("update-room-price");
const updateRoomLocationInput = document.getElementById("update-room-location");
const updateRoomImageInput = document.getElementById("update-room-image");
const updateRoomDescriptionInput = document.getElementById("update-room-description");
const updateRoomConfirmButton = document.getElementById("update-room-confirm");
const updateRoomFeedback = document.getElementById("update-room-feedback");
let carouselPageIndex = 0;
let selectedRoomType = "";
let selectedSlotKeys = new Set();
let selectedRoomToUpdate = null;

async function uploadRoomImageFile(file, token) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/rooms/upload-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Unable to upload room image.");
  }

  return body.imagePath;
}

const roomImageMap = {
  "Grand Hall": "../images/index/grand-hall.png",
  "Lecture Theatre": "../images/index/lecture-theatre.png",
  "Performing Arts": "../images/index/performing-arts.png",
  "Seminar Room": "../images/index/seminar.png",
  "Discussion Room": "../images/index/discussion-room.png",
  "Dance Studio": "../images/index/dance-studio.png",
};

function toTwelveHourLabel(hour24) {
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${suffix}`;
}

function buildHourlyBookingSlots() {
  const slots = [];
  for (let startHour = 8; startHour < 23; startHour += 1) {
    const endHour = startHour + 1;
    if (endHour > 23) break;
    slots.push({
      label: `${toTwelveHourLabel(startHour)} - ${toTwelveHourLabel(endHour)}`,
      start: `${String(startHour).padStart(2, "0")}:00`,
      end: `${String(endHour).padStart(2, "0")}:00`,
    });
  }
  return slots;
}

const bookingSlots = buildHourlyBookingSlots();

function formatPrice(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTodayDateText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isPastSlotForSelectedDate(selectedDate, slotStartTime) {
  if (!selectedDate || !slotStartTime) return false;
  const now = new Date();
  const todayText = getTodayDateText();
  if (selectedDate !== todayText) return false;

  const [hourText, minuteText] = String(slotStartTime).split(":");
  const slotStartDate = new Date(now);
  slotStartDate.setHours(Number(hourText || 0), Number(minuteText || 0), 0, 0);
  return slotStartDate <= now;
}

function createRoomCard(room) {
  const imageSource = room.image || roomImageMap[room.name] || "../images/index/discussion-room.png";
  const description = room.description || "A modern SIM room space for bookings, classes, and student collaboration.";
  const location = room.location || "SIM Campus";

  const article = document.createElement("article");
  article.className = "room-card";
  article.setAttribute("role", "listitem");
  article.innerHTML = `
    <h3>${room.name}</h3>
    <img src="${imageSource}" alt="${room.name}">
    <p class="room-description">${description}</p>
    <div class="room-meta">
      <p class="room-pill">Capacity: ${room.capacity}</p>
      <p class="room-pill">Price per hour: ${formatPrice(room.price)}</p>
      <p class="room-pill">Location: ${location}</p>
    </div>
    <div class="room-actions">
      <button type="button" class="book-button reserve-button" data-room-type="${room.name}">Reserve</button>
      <button type="button" class="book-button update-button" data-room-id="${room.id}" data-room-name="${room.name}" data-room-price="${room.price}" data-room-location="${location}" data-room-image="${room.image || ""}" data-room-description="${description}">Update</button>
      <button type="button" class="book-button delete-button" data-room-id="${room.id}" data-room-name="${room.name}">Delete</button>
    </div>
  `;
  return article;
}

function openReserveModal(roomType) {
  if (!bookingModal || !bookingModalRoom || !bookingDateInput) return;
  selectedRoomType = roomType;
  bookingModalRoom.textContent = `Reserve instantly for ${roomType}.`;
  bookingDateInput.min = getTodayDateText();
  bookingDateInput.removeAttribute("max");
  if (!bookingDateInput.value || bookingDateInput.value < bookingDateInput.min) {
    bookingDateInput.value = bookingDateInput.min;
  }
  selectedSlotKeys = new Set();
  updateSelectedSlotsSummary();
  bookingModal.classList.add("is-open");
  bookingModal.setAttribute("aria-hidden", "false");
  loadUnavailableSlots();
}

function closeReserveModal() {
  if (!bookingModal || !bookingFeedback) return;
  bookingModal.classList.remove("is-open");
  bookingModal.setAttribute("aria-hidden", "true");
  bookingFeedback.textContent = "";
  selectedSlotKeys = new Set();
  updateSelectedSlotsSummary();
}

function updateSelectedSlotsSummary() {
  if (!bookingSummary || !bookingConfirmButton) return;
  if (selectedSlotKeys.size === 0) {
    bookingSummary.textContent = "No slots selected.";
    bookingConfirmButton.disabled = true;
    return;
  }
  bookingSummary.textContent = `${selectedSlotKeys.size} slot(s) selected (${selectedSlotKeys.size} hour(s)).`;
  bookingConfirmButton.disabled = false;
}

async function loadUnavailableSlots() {
  if (!selectedRoomType || !bookingDateInput || !bookingSlotsContainer || !bookingFeedback) return;
  const token = localStorage.getItem("token");
  const selectedDate = bookingDateInput.value;
  if (!token || !selectedDate) return;
  bookingFeedback.textContent = "Loading slots...";

  try {
    const response = await fetch(
      `/api/booking/unavailable-slots/${encodeURIComponent(selectedRoomType)}?date=${encodeURIComponent(selectedDate)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      bookingFeedback.textContent = body.error || "Unable to load slots. Please try another date.";
      return;
    }

    const slotInfo = await response.json();
    const unavailableSet = new Set(slotInfo.unavailable_slots || []);
    bookingSlotsContainer.innerHTML = "";

    bookingSlots.forEach((slot) => {
      const slotKey = `${slot.start}-${slot.end}`;
      const isPastSlot = isPastSlotForSelectedDate(selectedDate, slot.start);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-button";
      button.textContent = slot.label;
      button.disabled = unavailableSet.has(slotKey) || isPastSlot;
      if (selectedSlotKeys.has(slotKey) && !button.disabled) {
        button.classList.add("is-selected");
      } else if (button.disabled) {
        selectedSlotKeys.delete(slotKey);
      }

      button.addEventListener("click", () => {
        if (selectedSlotKeys.has(slotKey)) {
          selectedSlotKeys.delete(slotKey);
          button.classList.remove("is-selected");
        } else {
          selectedSlotKeys.add(slotKey);
          button.classList.add("is-selected");
        }
        updateSelectedSlotsSummary();
      });

      bookingSlotsContainer.appendChild(button);
    });

    bookingFeedback.textContent = "Choose one or more available time slots, then reserve.";
    updateSelectedSlotsSummary();
  } catch (error) {
    bookingFeedback.textContent = "Network error while loading slots.";
  }
}

async function reserveSelectedSlots() {
  if (!selectedRoomType || !bookingDateInput || !bookingFeedback) return;
  const token = localStorage.getItem("token");
  const selectedDate = bookingDateInput.value;
  if (!token || !selectedDate) {
    bookingFeedback.textContent = "Please log in again to continue.";
    return;
  }
  if (selectedSlotKeys.size === 0) {
    bookingFeedback.textContent = "Please select at least one slot.";
    return;
  }

  const selectedSlots = bookingSlots.filter((slot) => selectedSlotKeys.has(`${slot.start}-${slot.end}`));
  bookingFeedback.textContent = "Creating reservation...";

  try {
    const response = await fetch("/api/booking/create-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_name: selectedRoomType,
        booking_date: selectedDate,
        slots: selectedSlots.map((slot) => ({
          start_time: slot.start,
          end_time: slot.end,
        })),
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      bookingFeedback.textContent = body.error || "Unable to create reservation.";
      await loadUnavailableSlots();
      return;
    }

    const reservedCount = Number(body.bookings_created || selectedSlots.length);
    bookingFeedback.textContent = `Reservation successful for ${reservedCount} hour(s).`;
    selectedSlotKeys = new Set();
    updateSelectedSlotsSummary();
    await loadUnavailableSlots();
  } catch (error) {
    bookingFeedback.textContent = "Network error while creating reservation.";
  }
}

function openUpdateRoomModal(room) {
  if (
    !updateRoomModal ||
    !updateRoomModalRoom ||
    !updateRoomPriceInput ||
    !updateRoomLocationInput ||
    !updateRoomImageInput ||
    !updateRoomDescriptionInput
  ) {
    return;
  }

  selectedRoomToUpdate = room;
  updateRoomModalRoom.textContent = `Editing ${room.name}`;
  updateRoomPriceInput.value = Number(room.price || 0);
  updateRoomLocationInput.value = room.location || "";
  updateRoomImageInput.value = "";
  updateRoomDescriptionInput.value = room.description || "";
  if (updateRoomFeedback) {
    updateRoomFeedback.textContent = "";
  }

  updateRoomModal.classList.add("is-open");
  updateRoomModal.setAttribute("aria-hidden", "false");
}

function closeUpdateRoomModal() {
  if (!updateRoomModal) return;
  updateRoomModal.classList.remove("is-open");
  updateRoomModal.setAttribute("aria-hidden", "true");
  selectedRoomToUpdate = null;
}

async function saveRoomUpdates() {
  if (
    !selectedRoomToUpdate ||
    !updateRoomPriceInput ||
    !updateRoomLocationInput ||
    !updateRoomImageInput ||
    !updateRoomDescriptionInput ||
    !updateRoomFeedback
  ) {
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) return;

  const price = Number(updateRoomPriceInput.value);
  const location = updateRoomLocationInput.value.trim();
  const imageFile = updateRoomImageInput.files?.[0];
  const description = updateRoomDescriptionInput.value.trim();

  if (Number.isNaN(price) || price < 0) {
    updateRoomFeedback.textContent = "Please enter a valid non-negative price.";
    return;
  }
  if (!location || !description) {
    updateRoomFeedback.textContent = "Location and description are required.";
    return;
  }

  updateRoomFeedback.textContent = "Saving room changes...";

  try {
    let image = selectedRoomToUpdate.image || "";
    if (imageFile) {
      updateRoomFeedback.textContent = "Uploading image...";
      image = await uploadRoomImageFile(imageFile, token);
    }

    updateRoomFeedback.textContent = "Saving room changes...";
    const response = await fetch(`/api/rooms/update-room/${encodeURIComponent(selectedRoomToUpdate.id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price,
        location,
        image,
        description,
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      updateRoomFeedback.textContent = body.error || "Unable to update room.";
      return;
    }

    updateRoomFeedback.textContent = "Room updated successfully.";
    await loadRooms();
    setTimeout(() => {
      closeUpdateRoomModal();
    }, 700);
  } catch (error) {
    updateRoomFeedback.textContent = "Network error while updating room.";
  }
}

async function deleteRoom(roomId, roomName) {
  const token = localStorage.getItem("token");
  if (!token || !roomId) return;

  const confirmed = window.confirm(
    `Delete ${roomName}? This removes the room record permanently.`,
  );
  if (!confirmed) return;

  roomsStatus.textContent = "Deleting room...";

  try {
    const response = await fetch(`/api/rooms/delete-room/${encodeURIComponent(roomId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      roomsStatus.textContent = body.error || "Unable to delete room.";
      return;
    }

    await loadRooms();
    roomsStatus.textContent = `${roomName} deleted successfully.`;
  } catch (error) {
    roomsStatus.textContent = "Network error while deleting room.";
  }
}

function attachRoomActionButtons() {
  const reserveButtons = Array.from(document.querySelectorAll(".reserve-button"));
  reserveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const roomType = button.getAttribute("data-room-type");
      if (roomType) {
        openReserveModal(roomType);
      }
    });
  });

  const updateButtons = Array.from(document.querySelectorAll(".update-button"));
  updateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const roomId = Number(button.getAttribute("data-room-id"));
      const roomName = button.getAttribute("data-room-name") || "";
      const roomPrice = Number(button.getAttribute("data-room-price") || 0);
      const roomLocation = button.getAttribute("data-room-location") || "";
      const roomImage = button.getAttribute("data-room-image") || "";
      const roomDescription = button.getAttribute("data-room-description") || "";
      if (!roomId || !roomName) return;

      openUpdateRoomModal({
        id: roomId,
        name: roomName,
        price: roomPrice,
        location: roomLocation,
        image: roomImage,
        description: roomDescription,
      });
    });
  });

  const deleteButtons = Array.from(document.querySelectorAll(".delete-button"));
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const roomId = button.getAttribute("data-room-id");
      const roomName = button.getAttribute("data-room-name") || "This room";
      await deleteRoom(roomId, roomName);
    });
  });
}

function getVisibleCardsPerPage() {
  if (window.matchMedia("(max-width: 760px)").matches) return 1;
  if (window.matchMedia("(max-width: 1080px)").matches) return 2;
  return 3;
}

function getRoomCards() {
  return Array.from(document.querySelectorAll(".room-card"));
}

function clampPageIndex(index, maxPageIndex) {
  return Math.min(Math.max(index, 0), Math.max(maxPageIndex, 0));
}

function getMaxPageIndex(roomsCount, visibleCardsPerPage) {
  return Math.ceil(roomsCount / visibleCardsPerPage) - 1;
}

function scrollToPageIndex(pageIndex) {
  const roomCards = getRoomCards();
  if (!roomCards.length || !roomsCarousel) return;
  const visibleCardsPerPage = getVisibleCardsPerPage();
  const maxPageIndex = getMaxPageIndex(roomCards.length, visibleCardsPerPage);
  const clampedPageIndex = clampPageIndex(pageIndex, maxPageIndex);
  const targetCardIndex = clampedPageIndex * visibleCardsPerPage;
  const targetCard = roomCards[targetCardIndex] || roomCards[roomCards.length - 1];
  carouselPageIndex = clampedPageIndex;
  roomsCarousel.scrollTo({ left: targetCard.offsetLeft, behavior: "smooth" });
}

function updateStartIndexFromScrollPosition() {
  const roomCards = getRoomCards();
  if (!roomCards.length || !roomsCarousel) return;
  let closestIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;

  roomCards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - roomsCarousel.scrollLeft);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = index;
    }
  });

  const visibleCardsPerPage = getVisibleCardsPerPage();
  carouselPageIndex = Math.floor(closestIndex / visibleCardsPerPage);
}

function attachCarouselControls() {
  if (!roomsCarousel || !prevButton || !nextButton) return;
  prevButton.addEventListener("click", () => {
    scrollToPageIndex(carouselPageIndex - 1);
  });
  nextButton.addEventListener("click", () => {
    scrollToPageIndex(carouselPageIndex + 1);
  });
  roomsCarousel.addEventListener("scroll", updateStartIndexFromScrollPosition);
  window.addEventListener("resize", updateStartIndexFromScrollPosition);
}

async function updateWelcomeText() {
  const token = localStorage.getItem("token");
  if (!token || !welcomeMessage) {
    return;
  }
  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
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
    // Fallback below
  }
  welcomeMessage.textContent = "Welcome to the UOW Room Booking System, Staff!";
}

async function loadRooms() {
  if (!roomsCarousel || !roomsStatus) return;
  roomsStatus.textContent = "Loading available rooms...";
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/html/index.html";
      return;
    }

    const launchedRequest = fetch("/api/rooms/launched");
    const draftRequest = fetch("/api/rooms/draft", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const [launchedResponse, draftResponse] = await Promise.all([launchedRequest, draftRequest]);

    if (!launchedResponse.ok || !draftResponse.ok) {
      roomsStatus.textContent = "Unable to load rooms right now. Please try again.";
      return;
    }

    const launchedRooms = await launchedResponse.json();
    const draftRooms = await draftResponse.json();
    const safeLaunched = Array.isArray(launchedRooms) ? launchedRooms : [];
    const safeDraft = Array.isArray(draftRooms) ? draftRooms : [];
    const allRooms = [...safeLaunched, ...safeDraft];

    if (allRooms.length === 0) {
      roomsStatus.textContent = "No launched rooms are currently available.";
      return;
    }

    roomsCarousel.innerHTML = "";
    allRooms.forEach((room) => {
      roomsCarousel.appendChild(createRoomCard(room));
    });
    attachRoomActionButtons();
    carouselPageIndex = 0;
    roomsStatus.textContent = `${allRooms.length} room record(s) available. Scroll to view more.`;
  } catch (error) {
    roomsStatus.textContent = "Network error while loading rooms. Please try again.";
  }
}

function attachReserveModalEvents() {
  if (bookingModalClose) {
    bookingModalClose.addEventListener("click", closeReserveModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) {
        closeReserveModal();
      }
    });
  }

  if (bookingDateInput) {
    bookingDateInput.addEventListener("change", () => {
      selectedSlotKeys = new Set();
      updateSelectedSlotsSummary();
      loadUnavailableSlots();
    });
  }

  if (bookingConfirmButton) {
    bookingConfirmButton.addEventListener("click", reserveSelectedSlots);
  }

  if (updateRoomModalClose) {
    updateRoomModalClose.addEventListener("click", closeUpdateRoomModal);
  }

  if (updateRoomModal) {
    updateRoomModal.addEventListener("click", (event) => {
      if (event.target === updateRoomModal) {
        closeUpdateRoomModal();
      }
    });
  }

  if (updateRoomConfirmButton) {
    updateRoomConfirmButton.addEventListener("click", saveRoomUpdates);
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/html/index.html";
  });
}

updateWelcomeText();
attachCarouselControls();
attachReserveModalEvents();
loadRooms();
