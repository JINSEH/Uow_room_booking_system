import { db } from "../createTable.js";

//API endpoints for booking related operations

//Get all bookings
export const getBookings = (req, res) => {
  const student_id = req.user.id;
  const bookings = db
    .prepare("SELECT * FROM bookings WHERE student_id=?")
    .all(student_id);
  res.json(bookings);
};

//Get a booking by ID
export const getBookingById = (req, res) => {
  const { bookingId } = req.params;

  // Get booking details + all rooms in that booking
  const rooms = db
    .prepare(
      `
        SELECT r.id, r.name, r.price, r.date, r.start_time, r.end_time
        FROM booking_rooms br
        JOIN rooms r ON r.id = br.room_id
        WHERE br.booking_id = ?
    `,
    )
    .all(bookingId);

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);

  res.json({ ...booking, rooms });
};

//Create a new booking
export const createBooking = (req, res) => {
  const { room_ids, promo_code } = req.body
  const student_id = req.user.id

  // Check if rooms exist + already booked + calculate total price in one loop
  let total_price = 0

  for (const roomId of room_ids) {
      const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)

      if (!room) {
          return res.status(404).json({ error: `Room ${roomId} not found` })
      }

      const existingBooking = db.prepare(`
          SELECT br.* FROM booking_rooms br
          JOIN bookings b ON b.id = br.booking_id
          WHERE br.room_id = ? 
          AND b.status = 'active'
      `).get(roomId)

      if (existingBooking) {
          return res.status(400).json({ error: `${room.name} is already booked` })
      }

      total_price += room.price
  }

  // Check if promo code was provided and apply discount
  let promo_code_id = null
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
  }

  const booking = db.prepare(
      'INSERT INTO bookings (student_id, promo_code_id, total_price) VALUES (?, ?, ?)'
  ).run(student_id, promo_code_id, total_price)

  const bookingId = booking.lastInsertRowid

  const insertRoom = db.prepare(
      'INSERT INTO booking_rooms (booking_id, room_id) VALUES (?, ?)'
  )

  for (const roomId of room_ids) {
      insertRoom.run(bookingId, roomId)
  }

  res.status(201).json({ message: 'Booking created', bookingId, total_price })
}

//Update a booking (needs tweaking)
export const updateBooking = (req, res) => {
  const { id } = req.params;
  const { room_ids, promo_code } = req.body;
  const student_id = req.user.id;

  // Check if booking exists and belongs to this student
  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ? AND student_id = ?")
    .get(id, student_id);

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // calculate total price
  let total_price = 0;
  for (const roomId of room_ids) {
    const room = db.prepare("SELECT price FROM rooms WHERE id = ?").get(roomId);
    total_price += room.price;
  }

  //Calculate total price if another promo code was added or removed
  let promo_code_id = null;
  if (promo_code) {
    const promo = db
      .prepare("SELECT * FROM promo_codes WHERE code = ?")
      .get(promo_code);

    if (!promo) {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    // Apply discount
    if (promo.discount_type === "flat") {
      total_price -= promo.discount_value; // e.g. $10 off
    } else if (promo.discount_type === "percent") {
      total_price -= total_price * (promo.discount_value / 100); // e.g. 10% off
    }

    promo_code_id = promo.id;
  }

  //Update the whole booking
  db.prepare(
    "UPDATE bookings SET total_price = ? AND promo_code_id WHERE id = ?",
  ).run(total_price, promo_code_id, id);

  //Change booking_rooms
  if (room_ids) {
    // Delete old rooms and insert new ones
    db.prepare("DELETE FROM booking_rooms WHERE booking_id = ?").run(id);

    const insertRoom = db.prepare(
      "INSERT INTO booking_rooms (booking_id, room_id) VALUES (?, ?)",
    );
    for (const roomId of room_ids) {
      insertRoom.run(id, roomId);
    }
  }

  res.json({ message: "Booking updated successfully" });
};

//Delete a booking
export const deleteBooking = (req, res) => {
  const { id } = req.params;
  const booking = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  if (booking) {
    res.json({ message: "Booking deleted successfully" });
  } else {
    res.status(404).json({ error: "Booking not found" });
  }
};

//API endpoints for booking room related operations
