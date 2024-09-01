const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: true,
      message: 'Access denied. No token provided.',
      statusCode: 401
    });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // Attach the decoded token payload to the request object
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: true,
      message: 'Access denied, please login.',
      statusCode: 403
    });
  }
};

module.exports = authenticateToken;
