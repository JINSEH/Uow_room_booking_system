const roomsCarousel = document.getElementById("rooms-carousel");
const roomsStatus = document.getElementById("rooms-status");
const welcomeMessage = document.getElementById("welcome-message");
const navHome = document.getElementById("nav-home");
const navBookings = document.getElementById("nav-bookings");
const prevButton = document.getElementById("rooms-prev");
const nextButton = document.getElementById("rooms-next");
const logoutButton = document.getElementById("logout-button");
const roomsSection = document.querySelector(".rooms-section");
const studentBookingsSection = document.getElementById("student-bookings-section");
const studentBookingsStatus = document.getElementById("student-bookings-status");
const studentBookingsList = document.getElementById("student-bookings-list");
const bookingModal = document.getElementById("booking-modal");
const bookingModalClose = document.getElementById("booking-modal-close");
const bookingModalRoom = document.getElementById("booking-modal-room");
const bookingDateInput = document.getElementById("booking-date");
const bookingSlotsContainer = document.getElementById("booking-slots");
const bookingSummary = document.getElementById("booking-summary");
const bookingConfirmButton = document.getElementById("booking-confirm");
const bookingFeedback = document.getElementById("booking-feedback");
const paymentModal = document.getElementById("payment-modal");
const paymentModalClose = document.getElementById("payment-modal-close");
const paymentRoomName = document.getElementById("payment-room-name");
const paymentBookingId = document.getElementById("payment-booking-id");
const paymentDate = document.getElementById("payment-date");
const paymentTime = document.getElementById("payment-time");
const paymentTotal = document.getElementById("payment-total");
const paymentPromoCode = document.getElementById("payment-promo-code");
const paymentConfirmButton = document.getElementById("payment-confirm");
const paymentFeedback = document.getElementById("payment-feedback");
const paynowPanel = document.getElementById("paynow-panel");
const cardPanel = document.getElementById("card-panel");
const paymentCardName = document.getElementById("payment-card-name");
const paymentCardNumber = document.getElementById("payment-card-number");
let carouselPageIndex = 0;
let selectedRoomType = "";
let selectedSlotKeys = new Set();
let selectedRoomHourlyPrice = 0;
let paymentBaseTotal = 0;
let promoQuoteRequestId = 0;

const roomImageMap = {
  "Grand Hall": "../images/index/grand-hall.png",
  "Lecture Theatre": "../images/index/lecture-theatre.png",
  "Performing Arts": "../images/index/performing-arts.png",
  "Seminar Room": "../images/index/seminar.png",
  "Discussion Room": "../images/index/discussion-room.png",
  "Dance Studio": "../images/index/dance-studio.png",
};


//Change the 24 hour format to 12 hour format
function toTwelveHourLabel(hour24) {
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${suffix}`;
}

//Build the hourly booking slots
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

//Format the price to SGD
function formatPrice(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

//Format the time display to 12 hour format
function formatTimeDisplay(timeText) {
  const [hourText, minuteText] = String(timeText || "00:00").split(":");
  const hour24 = Number(hourText);
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minuteText} ${suffix}`;
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
    <button type="button" class="book-button" data-room-type="${room.name}" data-room-price="${room.price}">Book now</button>
  `;
  return article;
}

async function updateWelcomeText() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    welcomeMessage.textContent = "Welcome to the UOW Room Booking System!";
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student";
      welcomeMessage.textContent = `Welcome to the UOW Room Booking System, ${roleLabel}!`;
      return;
    }

    const user = await response.json();
    const studentName = user?.name?.trim();

    if (studentName) {
      welcomeMessage.textContent = `Welcome to the UOW Room Booking System, ${studentName}!`;
      return;
    }
  } catch (error) {
    // Fall through to role-based fallback message.
  }

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student";
  welcomeMessage.textContent = `Welcome to the UOW Room Booking System, ${roleLabel}!`;
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

function getMaxBookingDateText() {
  const now = new Date();
  now.setDate(now.getDate() + 14);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function openBookingModal(roomType, roomPrice) {
  if (!bookingModal || !bookingModalRoom || !bookingDateInput) return;

  selectedRoomType = roomType;
  selectedRoomHourlyPrice = Number(roomPrice || 0);
  bookingModalRoom.textContent = `Book instantly for ${roomType}.`;
  const minBookingDate = getTodayDateText();
  const maxBookingDate = getMaxBookingDateText();
  bookingDateInput.min = minBookingDate;
  bookingDateInput.max = maxBookingDate;
  if (
    !bookingDateInput.value ||
    bookingDateInput.value < minBookingDate ||
    bookingDateInput.value > maxBookingDate
  ) {
    bookingDateInput.value = minBookingDate;
  }
  selectedSlotKeys = new Set();
  updateSelectedSlotsSummary();

  bookingModal.classList.add("is-open");
  bookingModal.setAttribute("aria-hidden", "false");
  loadUnavailableSlots();
}

function closeBookingModal() {
  if (!bookingModal || !bookingFeedback) return;
  bookingModal.classList.remove("is-open");
  bookingModal.setAttribute("aria-hidden", "true");
  bookingFeedback.textContent = "";
  selectedSlotKeys = new Set();
  updateSelectedSlotsSummary();
}

function showStudentHomeSection() {
  if (roomsSection) {
    roomsSection.classList.remove("student-bookings-hidden");
  }
  if (studentBookingsSection) {
    studentBookingsSection.classList.add("student-bookings-hidden");
  }
  navHome?.classList.add("is-active");
  navBookings?.classList.remove("is-active");
}

function showStudentBookingsSection() {
  if (roomsSection) {
    roomsSection.classList.add("student-bookings-hidden");
  }
  if (studentBookingsSection) {
    studentBookingsSection.classList.remove("student-bookings-hidden");
  }
  navHome?.classList.remove("is-active");
  navBookings?.classList.add("is-active");
}

//For payment modal 
//Close the payment modal
function closePaymentModal() {
  if (!paymentModal || !paymentFeedback || !paymentBookingId) return;
  paymentModal.classList.remove("is-open");
  paymentModal.setAttribute("aria-hidden", "true");
  paymentFeedback.textContent = "";
  paymentBookingId.textContent = "Pending";
}

// Lays out selected slots into text format
function formatSelectedSlotsText(selectedSlots) {
  return selectedSlots
    .map((slot) => slot.label)
    .join(", ");
}


//Get the current selected slots for payment modal
function getCurrentSelectedSlots() {
  return bookingSlots.filter((slot) => selectedSlotKeys.has(`${slot.start}-${slot.end}`));
}

//Open the payment modal
function openPaymentModal() {
  if (
    !paymentModal ||
    !paymentRoomName ||
    !paymentDate ||
    !paymentTime ||
    !paymentTotal ||
    !bookingDateInput
  ) {
    return;
  }

  const selectedSlots = getCurrentSelectedSlots();
  if (selectedSlots.length === 0) {
    bookingFeedback.textContent = "Please select at least one slot before payment.";
    return;
  }

  const estimatedTotal = selectedRoomHourlyPrice * selectedSlots.length;
  paymentBaseTotal = estimatedTotal;

  paymentRoomName.textContent = selectedRoomType;
  paymentDate.textContent = bookingDateInput.value;
  paymentTime.textContent = formatSelectedSlotsText(selectedSlots);
  paymentTotal.textContent = formatPrice(estimatedTotal);
  paymentBookingId.textContent = "Pending";
  if (paymentPromoCode) {
    paymentPromoCode.value = "";
  }
  if (paymentFeedback) {
    paymentFeedback.textContent = "";
  }

  paymentModal.classList.add("is-open");
  paymentModal.setAttribute("aria-hidden", "false");
}

//End of payment modal functions

// Updates the chosen slots summary
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

async function refreshPaymentTotalFromPromoCode() {
  if (!paymentTotal) return;

  const promoCodeValue = paymentPromoCode?.value?.trim() || "";
  if (!promoCodeValue) {
    paymentTotal.textContent = formatPrice(paymentBaseTotal);
    if (paymentFeedback) {
      paymentFeedback.textContent = "";
    }
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) return;

  const selectedSlots = getCurrentSelectedSlots();
  if (selectedSlots.length === 0) {
    paymentTotal.textContent = formatPrice(paymentBaseTotal);
    return;
  }

  const requestId = ++promoQuoteRequestId;

  try {
    const response = await fetch("/api/booking/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_name: selectedRoomType,
        slots: selectedSlots.map((slot) => ({
          start_time: slot.start,
          end_time: slot.end,
        })),
        promo_code: promoCodeValue,
      }),
    });

    // Ignore stale response if a newer promo code request already started.
    if (requestId !== promoQuoteRequestId) return;

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      paymentTotal.textContent = formatPrice(paymentBaseTotal);
      if (paymentFeedback) {
        paymentFeedback.textContent = body.error || "Invalid promo code.";
      }
      return;
    }

    paymentTotal.textContent = formatPrice(Number(body.total_price || 0));
    if (paymentFeedback) {
      paymentFeedback.textContent = body.discount_amount > 0
        ? `Promo applied. You save ${formatPrice(Number(body.discount_amount || 0))}.`
        : "Promo code is valid.";
    }
  } catch (error) {
    // Keep original total if quote service is unavailable.
    paymentTotal.textContent = formatPrice(paymentBaseTotal);
  }
}

// Loads the timeslots and disables the already booked time slots
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      bookingFeedback.textContent = body.error || "Unable to load slots. Please try another date.";
      return;
    }

    const slotInfo = await response.json();
    
    console.log('=== FRONTEND DEBUG ===');
    console.log('Response from API:', slotInfo);
    console.log('Unavailable slots array:', slotInfo.unavailable_slots);
    console.log('=====================');
    
    const unavailableSet = new Set(slotInfo.unavailable_slots || []);
    
    console.log('Unavailable Set:', unavailableSet);

    bookingSlotsContainer.innerHTML = "";
    bookingSlots.forEach((slot) => {
      const slotKey = `${slot.start}-${slot.end}`;
      const isPastSlot = isPastSlotForSelectedDate(selectedDate, slot.start);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-button";
      button.textContent = slot.label;
      button.disabled = unavailableSet.has(slotKey) || isPastSlot;
      
      console.log(`Slot ${slotKey}: disabled=${button.disabled}, in set=${unavailableSet.has(slotKey)}`);
      
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

    bookingFeedback.textContent = "Choose one or more available time slots, then confirm.";
    updateSelectedSlotsSummary();
  } catch (error) {
    bookingFeedback.textContent = "Network error while loading slots.";
  }
}

async function createBookingsForSelectedSlots() {
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
  
  const selectedSlots = bookingSlots.filter((slot) =>
    selectedSlotKeys.has(`${slot.start}-${slot.end}`),
);

if (paymentFeedback) {
  paymentFeedback.textContent = "Processing payment and creating booking...";
}

console.log(selectedDate);
console.log(selectedSlots);
  try {
    const promoCodeValue = paymentPromoCode?.value?.trim() || "";
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
        promo_code: promoCodeValue || undefined,
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (paymentFeedback) {
        paymentFeedback.textContent = body.error || "Unable to complete payment and booking.";
      }
      await loadUnavailableSlots();
      return;
    }

    const bookedCount = Number(body.bookings_created || selectedSlots.length);
    const totalCharged = Number(body.total_price || 0);
    const bookingIds = Array.isArray(body.bookingIds) ? body.bookingIds : [];
    const bookingGroupIds = Array.isArray(body.bookingGroupIds) ? body.bookingGroupIds : [];
    if (paymentBookingId) {
      paymentBookingId.textContent = bookingGroupIds.length
        ? bookingGroupIds.join(", ")
        : (bookingIds.length ? bookingIds.join(", ") : "Generated");
    }
    if (paymentFeedback) {
      paymentFeedback.textContent = `Payment successful. ${bookedCount} booking(s) confirmed.`;
    }
    bookingFeedback.textContent = `Booking confirmed for ${bookedCount} hour(s). Total charged: ${formatPrice(totalCharged)}.`;
    selectedSlotKeys = new Set();
    updateSelectedSlotsSummary();
    await loadUnavailableSlots();
    await loadStudentBookings();
    setTimeout(() => {
      closePaymentModal();
      closeBookingModal();
    }, 900);
  } catch (error) {
    if (paymentFeedback) {
      paymentFeedback.textContent = "Network error while processing payment.";
    }
  }
}

function groupRowsByBookingReference(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const groupKey = row.booking_group_id || `LEGACY-${row.id}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        bookingId: groupKey,
        bookingGroupId: row.booking_group_id || null,
        representativeBookingId: row.id,
        roomName: row.room_name,
        bookingDate: row.booking_date,
        status: row.status,
        times: [],
        totalPrice: 0,
        createdAt: row.created_at,
      });
    }

    const item = grouped.get(groupKey);
    if (item.status !== "active" && row.status === "active") {
      item.status = "active";
    }
    item.times.push({
      start_time: row.start_time,
      end_time: row.end_time,
    });
    item.totalPrice += Number(row.total_price || 0);
  });

  const groupedList = Array.from(grouped.values());
  groupedList.forEach((item) => {
    item.times.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
  });
  groupedList.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return groupedList;
}

function renderStudentBookings(bookings) {
  if (!studentBookingsList || !studentBookingsStatus) return;

  if (!Array.isArray(bookings) || bookings.length === 0) {
    studentBookingsList.innerHTML = "";
    studentBookingsStatus.textContent = "You do not have any bookings yet.";
    return;
  }

  const groupedBookings = groupRowsByBookingReference(bookings);
  studentBookingsStatus.textContent = `${groupedBookings.length} booking(s) found.`;
  studentBookingsList.innerHTML = "";

  groupedBookings.forEach((booking) => {
    const card = document.createElement("article");
    card.className = "student-booking-card";

    const timeRangeText = booking.times
      .map((slot) => `${formatTimeDisplay(slot.start_time)} - ${formatTimeDisplay(slot.end_time)}`)
      .join(", ");

    card.innerHTML = `
      <h3>${booking.roomName || "Room Booking"}</h3>
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Date:</strong> ${booking.bookingDate || "-"}</p>
      <p><strong>Time Slot(s):</strong> ${timeRangeText || "-"}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
      <p><strong>Total:</strong> ${formatPrice(booking.totalPrice)}</p>
      ${booking.status === "active" ? `<button type="button" class="student-cancel-booking-button" data-booking-id="${booking.representativeBookingId}" data-booking-group-id="${booking.bookingGroupId || ""}" data-room-name="${booking.roomName || ""}" data-booking-date="${booking.bookingDate || ""}">Cancel Booking</button>` : ""}
    `;

    studentBookingsList.appendChild(card);
  });
}

async function cancelStudentBooking({ bookingId, bookingGroupId, roomName, bookingDate }) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const useGroupEndpoint = Boolean(bookingGroupId);
  const endpoint = useGroupEndpoint
    ? `/api/booking/cancel-booking-group/${encodeURIComponent(bookingGroupId)}`
    : `/api/booking/cancel-booking/${encodeURIComponent(bookingId)}`;

  if (studentBookingsStatus) {
    studentBookingsStatus.textContent = "Cancelling booking...";
  }

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (studentBookingsStatus) {
        studentBookingsStatus.textContent = body.error || "Unable to cancel booking.";
      }
      return;
    }

    if (studentBookingsStatus) {
      studentBookingsStatus.textContent = "Booking cancelled successfully.";
    }
    await loadStudentBookings();

    // If booking modal is open for the same room/date, refresh slots immediately.
    if (
      bookingModal?.classList.contains("is-open") &&
      selectedRoomType &&
      bookingDateInput?.value &&
      selectedRoomType === roomName &&
      bookingDateInput.value === bookingDate
    ) {
      await loadUnavailableSlots();
    }
  } catch (error) {
    if (studentBookingsStatus) {
      studentBookingsStatus.textContent = "Network error while cancelling booking.";
    }
  }
}

async function loadStudentBookings() {
  if (!studentBookingsStatus) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  studentBookingsStatus.textContent = "Loading your bookings...";

  try {
    const response = await fetch("/api/booking", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      studentBookingsStatus.textContent = "Unable to load your bookings right now.";
      return;
    }

    const bookings = await response.json();
    renderStudentBookings(bookings);
  } catch (error) {
    studentBookingsStatus.textContent = "Network error while loading your bookings.";
  }
}

function attachPaymentMethodToggle() {
  const methodInputs = Array.from(document.querySelectorAll('input[name="payment-method"]'));
  methodInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
      if (selectedMethod === "card") {
        paynowPanel?.classList.add("payment-panel-hidden");
        cardPanel?.classList.remove("payment-panel-hidden");
      } else {
        cardPanel?.classList.add("payment-panel-hidden");
        paynowPanel?.classList.remove("payment-panel-hidden");
      }
    });
  });
}

function validatePaymentInputs() {
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
  if (selectedMethod !== "card") {
    return true;
  }

  if (!paymentCardName?.value?.trim() || !paymentCardNumber?.value?.trim()) {
    if (paymentFeedback) {
      paymentFeedback.textContent = "Please complete card name and card number.";
    }
    return false;
  }

  return true;
}

function attachBookingModalEvents() {
  if (bookingModalClose) {
    bookingModalClose.addEventListener("click", closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) {
        closeBookingModal();
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
    bookingConfirmButton.addEventListener("click", () => {
      openPaymentModal();
    });
  }

  if (paymentModalClose) {
    paymentModalClose.addEventListener("click", () => {
      closePaymentModal();
    });
  }

  if (paymentModal) {
    paymentModal.addEventListener("click", (event) => {
      if (event.target === paymentModal) {
        closePaymentModal();
      }
    });
  }

  if (paymentPromoCode) {
    paymentPromoCode.addEventListener("input", () => {
      refreshPaymentTotalFromPromoCode();
    });
  }

  if (paymentConfirmButton) {
    paymentConfirmButton.addEventListener("click", () => {
      if (!validatePaymentInputs()) return;
      createBookingsForSelectedSlots();
    });
  }

  attachPaymentMethodToggle();

  if (navHome) {
    navHome.addEventListener("click", (event) => {
      event.preventDefault();
      showStudentHomeSection();
    });
  }

  if (navBookings) {
    navBookings.addEventListener("click", async (event) => {
      event.preventDefault();
      showStudentBookingsSection();
      await loadStudentBookings();
    });
  }

  if (studentBookingsList) {
    studentBookingsList.addEventListener("click", async (event) => {
      const button = event.target.closest(".student-cancel-booking-button");
      if (!button) return;

      const bookingId = button.getAttribute("data-booking-id");
      const bookingGroupId = button.getAttribute("data-booking-group-id");
      const roomName = button.getAttribute("data-room-name") || "";
      const bookingDate = button.getAttribute("data-booking-date") || "";
      if (!bookingId) return;

      const confirmed = window.confirm(
        "Cancel this booking? The selected slot(s) will become available for others again.",
      );
      if (!confirmed) return;

      await cancelStudentBooking({
        bookingId,
        bookingGroupId: bookingGroupId || null,
        roomName,
        bookingDate,
      });
    });
  }
}

function attachBookButtons() {
  const buttons = Array.from(document.querySelectorAll(".book-button"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const roomType = button.getAttribute("data-room-type");
      const roomPrice = Number(button.getAttribute("data-room-price") || 0);
      if (roomType) {
        openBookingModal(roomType, roomPrice);
      }
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

  roomsCarousel.scrollTo({
    left: targetCard.offsetLeft,
    behavior: "smooth",
  });
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

async function loadRooms() {
  if (!roomsCarousel || !roomsStatus) return;

  roomsStatus.textContent = "Loading available rooms...";

  try {
    const response = await fetch("/api/rooms/launched");
    if (!response.ok) {
      roomsStatus.textContent = "Unable to load rooms right now. Please try again.";
      return;
    }

    const rooms = await response.json();

    if (!Array.isArray(rooms) || rooms.length === 0) {
      roomsStatus.textContent = "No launched rooms are currently available.";
      return;
    }

    // Keep one record per room type using API fields for display metadata.
    const roomByType = new Map();
    rooms.forEach((room) => {
      if (!roomByType.has(room.name)) {
        roomByType.set(room.name, room);
      }
    });

    const selectedRooms = Array.from(roomByType.values());

    if (selectedRooms.length === 0) {
      roomsStatus.textContent = "No room types are currently available.";
      return;
    }

    roomsCarousel.innerHTML = "";
    selectedRooms.forEach((room) => {
      roomsCarousel.appendChild(createRoomCard(room));
    });
    attachBookButtons();
    carouselPageIndex = 0;

    roomsStatus.textContent = `${selectedRooms.length} room type(s) available. Scroll to view more.`;
  } catch (error) {
    roomsStatus.textContent = "Network error while loading rooms. Please try again.";
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
attachBookingModalEvents();
loadRooms();
loadStudentBookings();
