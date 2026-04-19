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
  const { room_id, promo_code } = req.body
  const student_id = req.user.id

  // Check if room exists
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id)
  if (!room) {
      return res.status(404).json({ error: 'Room not found' })
  }

  // Check if room is already booked
  const existingBooking = db.prepare(
      'SELECT * FROM bookings WHERE room_id = ? AND status = "active"'
  ).get(room_id)
  if (existingBooking) {
      return res.status(400).json({ error: `${room.name} is already booked` })
  }

  // Calculate price
  let total_price = room.price

  // Apply promo code if provided
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
      'INSERT INTO bookings (student_id, room_id, promo_code_id, total_price) VALUES (?, ?, ?, ?)'
  ).run(student_id, room_id, promo_code_id, total_price)

  res.status(201).json({ message: 'Booking created', bookingId: booking.lastInsertRowid, total_price })
}

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
      db.prepare('UPDATE bookings SET promo_code_id = NULL, total_price = ? WHERE id = ?')
          .run(total_price, bookingId)
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

  db.prepare('UPDATE bookings SET status = "cancelled" WHERE id = ?').run(bookingId)

  res.json({ message: 'Booking cancelled successfully' })
}

//API endpoints for booking room related operations
