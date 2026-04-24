const roomsCarousel = document.getElementById("rooms-carousel");
const roomsStatus = document.getElementById("rooms-status");
const welcomeMessage = document.getElementById("welcome-message");
const prevButton = document.getElementById("rooms-prev");
const nextButton = document.getElementById("rooms-next");
const logoutButton = document.getElementById("logout-button");

const roomImageMap = {
  "Grand Hall": "../images/index/grand-hall.png",
  "Lecture Theatre": "../images/index/lecture-theatre.png",
  "Performing Arts": "../images/index/performing-arts.png",
  "Seminar Room": "../images/index/seminar.png",
  "Discussion Room": "../images/index/discussion-room.png",
  "Dance Studio": "../images/index/dance-studio.png",
};

// Only show five room types in the student carousel.
const preferredRoomTypes = [
  "Grand Hall",
  "Lecture Theatre",
  "Performing Arts",
  "Seminar Room",
  "Dance Studio",
];

const roomDetailsMap = {
  "Grand Hall": {
    description: "A spacious event venue suitable for talks, showcases, and large student gatherings.",
    location: "Block A, Level 1, SIM Campus",
  },
  "Lecture Theatre": {
    description: "Ideal for seminars and guest lectures with tiered seating for clear visibility.",
    location: "Block B, Level 2, SIM Campus",
  },
  "Performing Arts": {
    description: "Designed for rehearsals, showcases, and creative team activities.",
    location: "Arts Wing, Level 1, SIM Campus",
  },
  "Seminar Room": {
    description: "Great for workshops, tutorials, and team-based classroom sessions.",
    location: "Block C, Level 3, SIM Campus",
  },
  "Discussion Room": {
    description: "A focused collaboration space for project meetings and study groups.",
    location: "Library Zone, Level 2, SIM Campus",
  },
  "Dance Studio": {
    description: "An open studio space for movement training, choreography, and practice.",
    location: "Sports Complex, Level 1, SIM Campus",
  },
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

function createRoomCard(room) {
  const imageSource = roomImageMap[room.name] || "../images/index/discussion-room.png";
  const details = roomDetailsMap[room.name] || {
    description: "A modern SIM room space for bookings, classes, and student collaboration.",
    location: "SIM Campus",
  };

  const article = document.createElement("article");
  article.className = "room-card";
  article.setAttribute("role", "listitem");
  article.innerHTML = `
    <h3>${room.name}</h3>
    <img src="${imageSource}" alt="${room.name}">
    <p class="room-description">${details.description}</p>
    <div class="room-meta">
      <p class="room-pill">Capacity: ${room.capacity}</p>
      <p class="room-pill">Price: ${formatPrice(room.price)}</p>
      <p class="room-pill">Location: ${details.location}</p>
    </div>
    <button type="button" class="book-button">Book now</button>
  `;
  return article;
}

function updateWelcomeText() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student";

  if (!token) {
    welcomeMessage.textContent = "Welcome to the UOW Room Booking System!";
    return;
  }

  welcomeMessage.textContent = `Welcome to the UOW Room Booking System, ${roleLabel}!`;
}

function attachCarouselControls() {
  if (!roomsCarousel || !prevButton || !nextButton) return;

  const getScrollAmount = () => Math.max(roomsCarousel.clientWidth * 0.8, 260);

  prevButton.addEventListener("click", () => {
    roomsCarousel.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    roomsCarousel.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });
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

    // Keep one record per room type and only show the five selected types.
    const roomByType = new Map();
    rooms.forEach((room) => {
      if (!roomByType.has(room.name)) {
        roomByType.set(room.name, room);
      }
    });

    const selectedRooms = preferredRoomTypes
      .map((roomType) => roomByType.get(roomType))
      .filter(Boolean);

    if (selectedRooms.length === 0) {
      roomsStatus.textContent = "No selected room types are currently available.";
      return;
    }

    roomsCarousel.innerHTML = "";
    selectedRooms.forEach((room) => {
      roomsCarousel.appendChild(createRoomCard(room));
    });

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
loadRooms();
