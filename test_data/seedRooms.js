import { db } from '../createTable.js'

const seedRoomsStatement = db.prepare(`
    INSERT INTO rooms (name, capacity, price, description, location, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `);
  
  const seedRooms = [
    ["Grand Hall", 300, 500, "A spacious event venue suitable for talks, showcases, and large student gatherings.", "Block A, Level 1, SIM Campus", "launched", 1],
    ["Grand Hall", 300, 500, "A spacious event venue suitable for talks, showcases, and large student gatherings.", "Block A, Level 1, SIM Campus", "launched", 1],
    ["Lecture Theatre", 180, 50, "Ideal for seminars and guest lectures with tiered seating for clear visibility.", "Block B, Level 2, SIM Campus", "launched", 1],
    ["Lecture Theatre", 180, 50, "Ideal for seminars and guest lectures with tiered seating for clear visibility.", "Block B, Level 2, SIM Campus", "launched", 1],
    ["Performing Arts", 120, 200, "Designed for rehearsals, showcases, and creative team activities.", "Arts Wing, Level 1, SIM Campus", "launched", 1],
    ["Seminar Room", 60, 100, "Great for workshops, tutorials, and team-based classroom sessions.", "Block C, Level 3, SIM Campus", "launched", 1],
    ["Discussion Room", 20, 20, "A focused collaboration space for project meetings and study groups.", "Library Zone, Level 2, SIM Campus", "launched", 1],
    ["Dance Studio", 80, 50, "An open studio space for movement training, choreography, and practice.", "Sports Complex, Level 1, SIM Campus", "launched", 1],
  ];
  
  const insertManyRooms = db.transaction((rooms) => {
    // db.prepare("DELETE FROM rooms").run();
    for (const room of rooms) {
      seedRoomsStatement.run(...room);
    }
  });
  
  insertManyRooms(seedRooms);
  console.log('Rooms seeded successfully');