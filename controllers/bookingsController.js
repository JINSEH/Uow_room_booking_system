import {db} from '../createTable';

//API endpoints for booking related operations

//Get all bookings
export const getBookings = (req, res) => {
    const bookings = db.prepare('SELECT * FROM bookings').all();
    res.json(bookings);
}

//Get a booking by ID
export const getBookingById = (req, res) => {
    const { id } = req.params;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ error: 'Booking not found' });
    }
}

//Create a new booking
export const createBooking = (req, res) => {
    const { user_id, room_id, start_time, end_time } = req.body;
    const booking = db.prepare('INSERT INTO bookings (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)').run(user_id, room_id, start_time, end_time);
    res.status(201).json(booking);
}

//Update a booking
export const updateBooking = (req, res) => {
    const { id } = req.params;
    const { user_id, room_id, start_time, end_time } = req.body;
    const booking = db.prepare('UPDATE bookings SET user_id = ?, room_id = ?, start_time = ?, end_time = ? WHERE id = ?').run(user_id, room_id, start_time, end_time, id);
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ error: 'Booking not found' });
    }
}

//Delete a booking
export const deleteBooking = (req, res) => {
    const { id } = req.params;
    const booking = db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    if (booking) {
        res.json({ message: 'Booking deleted successfully' });
    } else {
        res.status(404).json({ error: 'Booking not found' });
    }
}

//API endpoints for booking room related operations


