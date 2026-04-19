import { db } from '../createTable.js'

const bookings = [
    {
        student_id: 2,
        room_id: 2,
        promo_code_id: null,
        total_price: 50.00,
        status: 'active'
    },
    {
        student_id: 2,
        room_id: 3,
        promo_code_id: 1, // SAVE10 - flat $10 off
        total_price: 20.00,
        status: 'active'
    },
    {
        student_id: 2,
        room_id: 7,
        promo_code_id: 3, // HALFOFF - 50% off
        total_price: 10.00,
        status: 'cancelled'
    }
]

const insertBooking = db.prepare(`
    INSERT OR IGNORE INTO bookings (student_id, room_id, promo_code_id, total_price, status)
    VALUES (?, ?, ?, ?, ?)
`)

for (const booking of bookings) {
    insertBooking.run(booking.student_id, booking.room_id, booking.promo_code_id, booking.total_price, booking.status)
}

console.log('Bookings seeded successfully')