// middleware/auth.js
import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
    //Splits "Bearer <token>" by space and returns just the token.
    const token = req.headers.authorization?.split(' ')[1] // Bearer <token>

    //If no token is provided to authentication, error is returned
    if (!token) {
        return res.status(401).json({ error: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(token, 'secret')
        req.user = decoded  // Now can access user id through req.user.id
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export const requireStaff = (req, res, next) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Staff only' })
    }
    next()
}

export const requireStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Students only' })
    }
    next()
}

export const requireStudentOrStaff = (req, res, next) => {
    if (req.user.role !== 'student' && req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Students or staff only' })
    }
    next()
}