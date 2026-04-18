const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  // Try both secrets
  const secrets = [process.env.JWT_SECRET, process.env.ADMIN_JWT_SECRET].filter(Boolean)
  let decoded = null
  for (const secret of secrets) {
    try {
      decoded = require('jsonwebtoken').verify(token, secret)
      break
    } catch (e) {}
  }

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin token' })
  }
  if (decoded.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  req.admin = decoded
  req.user = decoded
  next()
}

// Optional auth — attaches user if token present, doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {}
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth }
