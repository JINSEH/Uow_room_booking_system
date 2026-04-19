import { db } from '../createTable.js'
import bcrypt from 'bcrypt'

const staffPassword = await bcrypt.hash('password123', 10)
const studentPassword = await bcrypt.hash('password123', 10)

db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
`).run('CHEW KIAM CHENG TERENCE', 'terence@uow.edu.au', staffPassword, 'staff')

db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
`).run('EDWIN POH YANG QUAN', 'edwin@uow.edu.au', studentPassword, 'student')

console.log('Users seeded successfully')
