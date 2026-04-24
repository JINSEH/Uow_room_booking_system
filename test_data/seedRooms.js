import { db } from '../createTable.js'

const rooms = [
    {
        name: 'Seminar Room 1',
        capacity: 30,
        price: 50.00,
        status: 'launched',
        date: '2025-06-01',
        start_time: '09:00',
        end_time: '17:00',
        created_by: 1
    },
    {
        name: 'Seminar Room 2',
        capacity: 30,
        price: 50.00,
        status: 'launched',
        date: '2025-06-01',
        start_time: '09:00',
        end_time: '17:00',
        created_by: 1
    },
    {
        name: 'Tutorial Room A',
        capacity: 20,
        price: 30.00,
        status: 'launched',
        date: '2025-06-02',
        start_time: '08:00',
        end_time: '18:00',
        created_by: 1
    },
    {
        name: 'Tutorial Room B',
        capacity: 20,
        price: 30.00,
        status: 'launched',
        date: '2025-06-02',
        start_time: '08:00',
        end_time: '18:00',
        created_by: 1
    },
    {
        name: 'Computer Lab 1',
        capacity: 40,
        price: 80.00,
        status: 'launched',
        date: '2025-06-03',
        start_time: '09:00',
        end_time: '17:00',
        created_by: 1
    },
    {
        name: 'Computer Lab 2',
        capacity: 40,
        price: 80.00,
        status: 'draft',
        date: '2025-06-03',
        start_time: '09:00',
        end_time: '17:00',
        created_by: 1
    },
    {
        name: 'Discussion Room 1',
        capacity: 8,
        price: 20.00,
        status: 'launched',
        date: '2025-06-04',
        start_time: '08:00',
        end_time: '22:00',
        created_by: 1
    },
    {
        name: 'Discussion Room 2',
        capacity: 8,
        price: 20.00,
        status: 'launched',
        date: '2025-06-04',
        start_time: '08:00',
        end_time: '22:00',
        created_by: 1
    },
    {
        name: 'Lecture Theatre',
        capacity: 200,
        price: 200.00,
        status: 'launched',
        date: '2025-06-05',
        start_time: '09:00',
        end_time: '17:00',
        created_by: 1
    },
    {
        name: 'Meeting Room',
        capacity: 12,
        price: 40.00,
        status: 'launched',
        date: '2025-06-05',
        start_time: '08:00',
        end_time: '20:00',
        created_by: 1
    }
]

const insertRoom = db.prepare(`
    INSERT OR IGNORE INTO rooms (name, capacity, price, status, date, start_time, end_time, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

for (const room of rooms) {
    insertRoom.run(room.name, room.capacity, room.price, room.status, room.date, room.start_time, room.end_time, room.created_by)
}

console.log('Rooms seeded successfully')

const seedRoomsStatement = db.prepare(`
    INSERT OR IGNORE INTO rooms (name, capacity, price, status, created_by)
    VALUES (?, ?, ?, ?, ?);
  `);
  
  const seedRooms = [
    ["Grand Hall", 300, 500, "launched", 1],
    ["Lecture Theatre", 180, 50, "launched", 1],
    ["Performing Arts", 120, 200, "launched", 1],
    ["Seminar Room", 60, 100, "launched", 1],
    ["Discussion Room", 20, 20, "launched", 1],
    ["Dance Studio", 80, 50, "launched", 1],
  ];
  
  const insertManyRooms = db.transaction((rooms) => {
    for (const room of rooms) {
      seedRoomsStatement.run(...room);
    }
  });
  
  insertManyRooms(seedRooms);