import { db } from "../createTable.js";

//API endpoints for booking related operations
const MAX_ADVANCE_BOOKING_DAYS = 14;

function getNormalizedRole(roleValue) {
  return String(roleValue || "").trim().toLowerCase();
}

function parseDateText(dateText) {
  const [yearText, monthText, dayText] = String(dateText || "").split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function isBookingDateWithinWindow(dateText) {
  const selectedDate = parseDateText(dateText);
  if (!selectedDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_BOOKING_DAYS);

  return selectedDate >= today && selectedDate <= maxDate;
}

function getPromoByCode(codeValue) {
  const normalizedCode = String(codeValue || "").trim();
  if (!normalizedCode) return null;
  return db
    .prepare("SELECT * FROM promo_codes WHERE code = ? COLLATE NOCASE")
    .get(normalizedCode);
}

function calculateBookingTotal({ roomPrice, slotCount, promoCode }) {
  const normalizedRoomPrice = Number(roomPrice || 0);
  const normalizedSlotCount = Number(slotCount || 0);
  const subtotal = normalizedSlotCount * normalizedRoomPrice;
  let total_price = subtotal;
  let promo_code_id = null;
  let discount_amount = 0;

  if (promoCode) {
    const promo = getPromoByCode(promoCode);
    if (!promo) {
      return { error: "Invalid promo code" };
    }

    if (promo.discount_type === "flat") {
      discount_amount = Number(promo.discount_value || 0);
    } else if (promo.discount_type === "percent") {
      discount_amount = subtotal * (Number(promo.discount_value || 0) / 100);
    }

    total_price = subtotal - discount_amount;
    promo_code_id = promo.id;
  }

  if (total_price < 0) {
    total_price = 0;
  }

  return {
    subtotal,
    total_price,
    discount_amount: Math.max(0, subtotal - total_price),
    promo_code_id,
  };
}

//Get all bookings
export const getBookings = (req, res) => {
  const student_id = req.user.id;
  const bookings = db
    .prepare(`
      SELECT
        bookings.*,
        rooms.name AS room_name
      FROM bookings
      JOIN rooms ON rooms.id = bookings.room_id
      WHERE bookings.student_id = ?
      ORDER BY bookings.created_at DESC
    `)
    .all(student_id);
  res.json(bookings);
};

//Get a booking by ID
export const getBookingById = (req, res) => {
  const { bookingId } = req.params;

  // Get booking details via id
  const booking = db
    .prepare(
      `
       SELECT * FROM bookings WHERE id = ?
    `,
    )
    .get(bookingId);

  res.json({ booking });
};

//Create a new booking
export const createBooking = (req, res) => {
  const { room_name, booking_date, slots, promo_code } = req.body;
  const student_id = req.user.id;
  const currentRole = getNormalizedRole(req.user?.role);

  if (!booking_date) {
    return res.status(400).json({ error: 'booking_date is required' });
  }
  if (currentRole === "student" && !isBookingDateWithinWindow(booking_date)) {
    return res.status(400).json({
      error: "booking_date must be between today and 14 days from today",
    });
  }

  if (!room_name) {
    return res.status(400).json({ error: 'room_name is required' });
  }

  const requestedSlots = Array.isArray(slots) && slots.length > 0
    ? slots
    : [];

  if (requestedSlots.length === 0) {
    return res.status(400).json({ error: 'At least one slot is required' });
  }

  const invalidSlot = requestedSlots.find((slot) => !slot?.start_time || !slot?.end_time);
  if (invalidSlot) {
    return res.status(400).json({ error: 'Each slot must include start_time and end_time' });
  }

  // Get the single room for this room type
  const room = db.prepare(`
    SELECT * FROM rooms 
    WHERE name = ? AND status = 'launched'
    LIMIT 1
  `).get(room_name);

  if (!room) {
    return res.status(400).json({ error: 'Room type not found or not available' });
  }

  // Check if ANY of the requested slots are already booked
  for (const slot of requestedSlots) {
    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE room_id = ?
        AND booking_date = ?
        AND start_time = ?
        AND end_time = ?
        AND status = 'active'
      LIMIT 1
    `).get(room.id, booking_date, slot.start_time, slot.end_time);

    if (conflict) {
      return res.status(400).json({
        error: `Slot ${slot.start_time}-${slot.end_time} is already booked.`,
      });
    }
  }

  // Sort slots and group consecutive ones
  const sortedSlots = requestedSlots
    .map(slot => ({ ...slot, room_id: room.id }))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const slotGroups = [];
  for (const slot of sortedSlots) {
    if (slotGroups.length === 0) {
      slotGroups.push([slot]);
      continue;
    }

    const currentGroup = slotGroups[slotGroups.length - 1];
    const previous = currentGroup[currentGroup.length - 1];
    
    if (previous.end_time === slot.start_time) {
      currentGroup.push(slot);
    } else {
      slotGroups.push([slot]);
    }
  }

  // Calculate pricing
  const slotCount = sortedSlots.length;
  const pricing = calculateBookingTotal({
    roomPrice: room.price,
    slotCount,
    promoCode: promo_code,
  });
  if (pricing.error) {
    return res.status(400).json({ error: pricing.error });
  }
  const subtotal = pricing.subtotal;
  const total_price = pricing.total_price;
  const promo_code_id = pricing.promo_code_id;

  const perSlotPrice = slotCount > 0 ? total_price / slotCount : 0;

  // Insert bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings
    (booking_group_id, student_id, room_id, promo_code_id, booking_date, start_time, end_time, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createManyBookings = db.transaction((groups) => {
    const bookingIds = [];
    const bookingGroupIds = [];

    for (const group of groups) {
      const bookingGroupId = `BKG-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      bookingGroupIds.push(bookingGroupId);

      for (const slot of group) {
        const result = insertBooking.run(
          bookingGroupId,
          student_id,
          room.id,
          promo_code_id,
          booking_date,
          slot.start_time,
          slot.end_time,
          perSlotPrice,
        );
        bookingIds.push(result.lastInsertRowid);
      }
    }
    return { bookingIds, bookingGroupIds };
  });

  const created = createManyBookings(slotGroups);

  res.status(201).json({
    message: 'Booking(s) created',
    bookingIds: created.bookingIds,
    bookingGroupIds: created.bookingGroupIds,
    bookings_created: created.bookingIds.length,
    hourly_rate: Number(room.price),
    total_price,
  });
};

// Get a price quote for selected slots before creating booking
export const getBookingQuote = (req, res) => {
  const { room_name, slots, promo_code } = req.body;

  if (!room_name) {
    return res.status(400).json({ error: "room_name is required" });
  }

  const requestedSlots = Array.isArray(slots) ? slots : [];
  if (requestedSlots.length === 0) {
    return res.status(400).json({ error: "At least one slot is required" });
  }

  const invalidSlot = requestedSlots.find((slot) => !slot?.start_time || !slot?.end_time);
  if (invalidSlot) {
    return res.status(400).json({ error: "Each slot must include start_time and end_time" });
  }

  const room = db
    .prepare(
      `
    SELECT * FROM rooms
    WHERE name = ? AND status = 'launched'
    LIMIT 1
  `,
    )
    .get(room_name);

  if (!room) {
    return res.status(400).json({ error: "Room type not found or not available" });
  }

  const slotCount = requestedSlots.length;
  const pricing = calculateBookingTotal({
    roomPrice: room.price,
    slotCount,
    promoCode: promo_code,
  });
  if (pricing.error) {
    return res.status(400).json({ error: pricing.error });
  }

  return res.json({
    room_name,
    slot_count: slotCount,
    hourly_rate: Number(room.price),
    subtotal: pricing.subtotal,
    discount_amount: pricing.discount_amount,
    total_price: pricing.total_price,
    promo_applied: Boolean(String(promo_code || "").trim()),
  });
};

//Get unavailable timeslots for a room type/name and date
export const getUnavailableSlots = (req, res) => {
  const { roomName } = req.params;
  const { date } = req.query;
  const currentRole = getNormalizedRole(req.user?.role);

  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }
  if (currentRole === "student" && !isBookingDateWithinWindow(date)) {
    return res.status(400).json({
      error: "date must be between today and 14 days from today",
    });
  }

  // Get all time slots that already have an active booking for this room
  const bookedSlots = db.prepare(`
    SELECT b.start_time, b.end_time
    FROM bookings b
    JOIN rooms r ON r.id = b.room_id
    WHERE b.status = 'active'
      AND b.booking_date = ?
      AND r.name = ?
      AND r.status = 'launched'
  `).all(date, roomName);

  console.log('=== BACKEND DEBUG ===');
  console.log('Room Name:', roomName);
  console.log('Date:', date);
  console.log('Booked Slots from DB:', bookedSlots);

  const unavailable = bookedSlots.map(
    (slot) => `${slot.start_time}-${slot.end_time}`
  );

  console.log('Unavailable slots being sent:', unavailable);
  console.log('===================');

  res.json({
    room_name: roomName,
    booking_date: date,
    unavailable_slots: unavailable,
  });
};

//Update a booking when student decides to remove promo code
export const updateBooking = (req, res) => {
  const { bookingId } = req.params
  const { promo_code, remove_promo } = req.body
  const student_id = req.user.id

  // Check if booking exists and belongs to this student
  const booking = db.prepare(
      'SELECT * FROM bookings WHERE id = ? AND student_id = ?'
  ).get(bookingId, student_id)

  if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(booking.room_id)
  let total_price = room.price
  let promo_code_id = null

  // Remove promo code, need to add this option to frontend
  if (remove_promo) {
      db.prepare('UPDATE bookings SET promo_code_id = ?, total_price = ? WHERE id = ?')
          .run(null, total_price, bookingId)
      return res.json({ message: 'Promo code removed', total_price })
  }

  // Update promo code
  if (promo_code) {
      const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ?').get(promo_code)

      if (!promo) {
          return res.status(400).json({ error: 'Invalid promo code' })
      }

      if (promo.discount_type === 'flat') {
          total_price -= promo.discount_value
      } else if (promo.discount_type === 'percent') {
          total_price -= total_price * (promo.discount_value / 100)
      }

      promo_code_id = promo.id
      db.prepare('UPDATE bookings SET promo_code_id = ?, total_price = ? WHERE id = ?')
          .run(promo_code_id, total_price, bookingId)
      return res.json({ message: 'Promo code updated', total_price })
  }

  return res.status(400).json({ error: 'Please provide a promo code or remove the promo code' })
}

//Cancel a booking
export const cancelBooking = (req, res) => {
  const { bookingId } = req.params
  const student_id = req.user.id

  const booking = db.prepare(
      'SELECT * FROM bookings WHERE id = ? AND student_id = ?'
  ).get(bookingId, student_id)

  if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
  }

  if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' })
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ? AND student_id = ?').run('cancelled',bookingId, student_id)

  res.json({ message: 'Booking cancelled successfully' })
}

//Cancel a grouped booking by booking_group_id
export const cancelBookingGroup = (req, res) => {
  const { bookingGroupId } = req.params;
  const student_id = req.user.id;

  const bookings = db
    .prepare(
      `SELECT id, status
       FROM bookings
       WHERE booking_group_id = ? AND student_id = ?`
    )
    .all(bookingGroupId, student_id);

  if (!bookings || bookings.length === 0) {
    return res.status(404).json({ error: "Booking group not found" });
  }

  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");
  if (activeBookings.length === 0) {
    return res.status(400).json({ error: "Booking group is already cancelled" });
  }

  db.prepare(
    `UPDATE bookings
     SET status = 'cancelled'
     WHERE booking_group_id = ? AND student_id = ?`
  ).run(bookingGroupId, student_id);

  res.json({
    message: "Booking group cancelled successfully",
    cancelled_count: activeBookings.length,
  });
};

//API endpoints for booking room related operations
