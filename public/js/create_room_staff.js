const logoutButton = document.getElementById("logout-button");
const createRoomForm = document.getElementById("create-room-form");
const roomNameInput = document.getElementById("room-name");
const roomCapacityInput = document.getElementById("room-capacity");
const roomPriceInput = document.getElementById("room-price");
const roomLocationInput = document.getElementById("room-location");
const roomImageInput = document.getElementById("room-image");
const roomDescriptionInput = document.getElementById("room-description");
const createRoomFeedback = document.getElementById("create-room-feedback");

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

async function submitCreateRoom(event) {
  event.preventDefault();
  if (
    !roomNameInput ||
    !roomCapacityInput ||
    !roomPriceInput ||
    !roomLocationInput ||
    !roomImageInput ||
    !roomDescriptionInput ||
    !createRoomFeedback
  ) {
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/html/index.html";
    return;
  }

  const name = roomNameInput.value.trim();
  const capacity = Number(roomCapacityInput.value);
  const price = Number(roomPriceInput.value);
  const location = roomLocationInput.value.trim();
  const imageFile = roomImageInput.files?.[0];
  const description = roomDescriptionInput.value.trim();

  if (!name || !location || !description || !imageFile) {
    createRoomFeedback.textContent = "Please fill in all required fields.";
    return;
  }
  if (Number.isNaN(capacity) || capacity <= 0) {
    createRoomFeedback.textContent = "Capacity must be greater than 0.";
    return;
  }
  if (Number.isNaN(price) || price < 0) {
    createRoomFeedback.textContent = "Price must be 0 or higher.";
    return;
  }

  createRoomFeedback.textContent = "Creating room...";

  try {
    createRoomFeedback.textContent = "Uploading image...";
    const image = await uploadRoomImageFile(imageFile, token);
    console.log({body: JSON.stringify({
      name,
      capacity,
      price,
      location,
      image,
      description,
    })});

    createRoomFeedback.textContent = "Creating room...";
    const response = await fetch("/api/rooms/create-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        capacity,
        price,
        location,
        image,
        description,
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      createRoomFeedback.textContent = body.error || "Unable to create room.";
      return;
    }

    createRoomFeedback.textContent = "Room created successfully.";
    createRoomForm.reset();
  } catch (error) {
    createRoomFeedback.textContent = "Network error while creating room.";
  }
}

if (createRoomForm) {
  createRoomForm.addEventListener("submit", submitCreateRoom);
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/html/index.html";
  });
}
